from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import db, User, Analysis
import jwt
import datetime
from flask import current_app
import os
from app.services.supabaseAuth import SupabaseAuth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    analysis_id = data.get('analysis_id')  # Optional analysis_id from roadmap generation

    supabase = SupabaseAuth().create_client(os.environ.get("SUPABASE_KEY"), os.environ.get("SUPABASE_URL"))
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    # Check for duplicate username or email in local database before Supabase registration
    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({'error': 'Username or email already exists'}), 400
    
    supabase_user = None
    try:
        # print(f"Registration attempt - analysis_id: {analysis_id}")
        supabase_user = supabase.auth.sign_up({"email": email, "password": password})

        # Validate analysis_id if provided
        linked_analysis = None
        if analysis_id:
            print(f"Looking for analysis with ID: {analysis_id}")
            linked_analysis = Analysis.query.get(analysis_id)
            if not linked_analysis:
                print(f"Analysis {analysis_id} not found in database")
                # Clean up Supabase user before returning error
                try:
                    supabase.auth.admin.delete_user(supabase_user.user.id)
                except Exception as cleanup_error:
                    print(f"Failed to cleanup Supabase user: {cleanup_error}")
                return jsonify({'error': 'Invalid analysis_id provided'}), 400
            print(f"Found analysis: {linked_analysis.id}, status: {linked_analysis.status}")
            if linked_analysis.status != 'completed':
                print(f"Analysis {analysis_id} not completed yet")
                # Clean up Supabase user before returning error
                try:
                    supabase.auth.admin.delete_user(supabase_user.user.id)
                except Exception as cleanup_error:
                    print(f"Failed to cleanup Supabase user: {cleanup_error}")
                return jsonify({'error': 'Analysis must be completed before linking to account'}), 400

        # hashed_password = generate_password_hash(password)
        user = User(
            username=username,
            email=email,
            supabase_user_id=supabase_user.user.id,
            linked_analysis_id=analysis_id if linked_analysis else None
        )
        db.session.add(user)
    
        # If linking to an analysis, also update the analysis with the new user_id
        if linked_analysis:
            linked_analysis.user_id = user.id
            print(f"Updated analysis {linked_analysis.id} with user_id: {user.id}")
    
        try:
            db.session.commit()
        except Exception as commit_error:
            # Rollback database changes
            db.session.rollback()
            print(f"Database commit failed: {commit_error}")
            
            # Attempt to cleanup the Supabase user
            try:
                supabase.auth.admin.delete_user(supabase_user.user.id)
                print(f"Successfully cleaned up Supabase user after database failure")
            except Exception as cleanup_error:
                print(f"Failed to cleanup Supabase user after database failure: {cleanup_error}")
            
            return jsonify({'error': f'Failed to register user: {str(commit_error)}'}), 500

        response_data = {'message': 'User registered successfully'}
        if analysis_id:
            response_data['linked_analysis_id'] = analysis_id
            response_data['message'] = 'User registered successfully and linked to previous roadmap analysis'

        return jsonify(response_data), 201
    except Exception as e:
        # Rollback any pending database changes
        db.session.rollback()
        
        # If a Supabase user was created, attempt to clean it up
        if supabase_user:
            try:
                supabase.auth.admin.delete_user(supabase_user.user.id)
                print(f"Successfully cleaned up Supabase user after error")
            except Exception as cleanup_error:
                print(f"Failed to cleanup Supabase user: {cleanup_error}")
        
        print(f"Error in {str(e)}")
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    supabase = SupabaseAuth().create_client(os.environ.get("SUPABASE_KEY"), os.environ.get("SUPABASE_URL"))

    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        session['user_id'] = response.user.id
        session['access_token'] = response.session.access_token

        from app.models import User
        user = User.query.filter_by(supabase_user_id=session['user_id']).first()

        if user is None:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "message": "Logged in successfully",
            "token": session['access_token'],
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@auth_bp.route('/verifyOTP', methods=['POST'])
def verify_OTP():
    data = request.get_json()
    email = data.get('email')
    verification_OTP = data.get('otp')

    if not email or not verification_OTP:
        return jsonify({'error': 'Missing verification One time password'}), 400

    supabase = SupabaseAuth().create_client(os.environ.get("SUPABASE_KEY"), os.environ.get("SUPABASE_URL"))

    try:
        response = supabase.auth.verify_otp({'email': email, 'token': verification_OTP, 'type': 'email'})
        session['user_id'] = response.user.id
        session['access_token'] = response.session.access_token

        from app.models import User
        user = User.query.filter_by(supabase_user_id=session['user_id']).first()
        if user is None:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'message': "User account verified successfully ", "user": { "id": user.id, "username": user.username, "email": user.email}, "token": session['access_token']})
    except Exception as e:
        return jsonify({"error": str(e)}),401

@auth_bp.route('/user/linked-analysis', methods=['GET'])
def get_user_linked_analysis():
    """
    Get the user's linked analysis and associated roadmaps
    Requires authentication token
    """
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization token required'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.linked_analysis_id:
            return jsonify({
                'user_id': user.id,
                'linked_analysis_id': None,
                'message': 'No linked analysis found'
            }), 200
        
        # Get the linked analysis
        analysis = user.linked_analysis
        if not analysis:
            return jsonify({'error': 'Linked analysis not found'}), 404
        
        # Get roadmaps associated with this analysis
        from app.models import Roadmap
        roadmaps = Roadmap.query.filter_by(analysis_id=analysis.id).all()
        
        roadmap_data = []
        for roadmap in roadmaps:
            roadmap_data.append({
                'roadmap_id': roadmap.id,
                'title': roadmap.title,
                'estimated_total_duration_months': roadmap.estimated_total_duration_months,
                'created_at': roadmap.created_at.isoformat() + 'Z',
                'is_saved': roadmap.is_saved
            })
        
        return jsonify({
            'user_id': user.id,
            'linked_analysis_id': analysis.id,
            'analysis': {
                'target_skill': analysis.target_skill,
                'status': analysis.status,
                'created_at': analysis.created_at.isoformat() + 'Z',
                'completed_at': analysis.completed_at.isoformat() + 'Z' if analysis.completed_at else None
            },
            'roadmaps': roadmap_data,
            'message': 'Linked analysis and roadmaps retrieved successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/user/link-analysis', methods=['POST'])
def link_analysis_to_user():
    """
    Link an existing analysis to the authenticated user
    Useful for cases where users generated roadmaps before creating accounts
    """
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization token required'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        analysis_id = data.get('analysis_id')
        
        if not analysis_id:
            return jsonify({'error': 'analysis_id is required'}), 400
        
        # Validate analysis exists and is completed
        analysis = Analysis.query.get(analysis_id)
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        if analysis.status != 'completed':
            return jsonify({'error': 'Analysis must be completed before linking'}), 400
        
        # Check if analysis is already linked to another user
        if analysis.user_id and analysis.user_id != user_id:
            return jsonify({'error': 'Analysis is already linked to another user'}), 409
        
        # Check if user already has a linked analysis
        if user.linked_analysis_id and user.linked_analysis_id != analysis_id:
            return jsonify({'error': 'User already has a linked analysis. Unlink first.'}), 409
        
        # Link the analysis to the user
        user.linked_analysis_id = analysis_id
        analysis.user_id = user_id
        
        # Also update any roadmaps associated with this analysis to link to the user
        from app.models import Roadmap
        roadmaps = Roadmap.query.filter_by(analysis_id=analysis_id).all()
        for roadmap in roadmaps:
            roadmap.user_id = user_id
        
        db.session.commit()
        
        return jsonify({
            'message': 'Analysis linked to user successfully',
            'analysis_id': analysis_id,
            'linked_roadmaps_count': len(roadmaps)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/user/unlink-analysis', methods=['POST'])
def unlink_analysis_from_user():
    """
    Unlink the current analysis from the authenticated user
    """
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization token required'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.linked_analysis_id:
            return jsonify({'error': 'No linked analysis to unlink'}), 400
        
        # Get the linked analysis
        analysis = Analysis.query.get(user.linked_analysis_id)
        old_analysis_id = user.linked_analysis_id
        
        # Unlink from user
        user.linked_analysis_id = None
        if analysis:
            analysis.user_id = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Analysis unlinked from user successfully',
            'unlinked_analysis_id': old_analysis_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        supabase = SupabaseAuth().create_client(os.environ.get("SUPABASE_KEY"), os.environ.get("SUPABASE_URL"))

        supabase.auth.sign_out()
        session.pop('user_id', None)
        session.pop('access_token', None)
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500