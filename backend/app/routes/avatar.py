from flask import request, jsonify
from app.models import db
from app.routes.profile import get_user_from_token
from flask import Blueprint
import os
from werkzeug.utils import secure_filename

avatar_bp = Blueprint('avatar', __name__)

UPLOAD_FOLDER = 'static/avatars/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@avatar_bp.route('/upload_avatar', methods=['POST'])
def upload_avatar():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    if 'avatar' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{user.id}_avatar.{file.filename.rsplit('.', 1)[1].lower()}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(filepath)
        user.image_url = f"/{filepath}"
        db.session.commit()
        return jsonify({'message': 'Avatar uploaded successfully.', 'image_url': user.image_url}), 201
    return jsonify({'error': 'Invalid file type'}), 400
