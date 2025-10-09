from flask import request, jsonify
from app.models import db
from app.routes.profile import get_user_from_token

from werkzeug.security import check_password_hash

from flask import Blueprint
password_bp = Blueprint('password', __name__)

@password_bp.route('/change_password', methods=['POST'])
def change_password():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    current = data.get('current')
    new = data.get('new')
    confirm = data.get('confirm')
    if not current or not new or not confirm:
        return jsonify({'error': 'All password fields are required.'}), 400
    if not user.check_password(current):
        return jsonify({'error': 'Current password is incorrect.'}), 400
    if new != confirm:
        return jsonify({'error': 'New passwords do not match.'}), 400
    user.set_password(new)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully.'})
