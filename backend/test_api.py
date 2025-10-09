#!/usr/bin/env python3
"""
Test script for SkillBridge API endpoints 1-6
Run this after starting the Flask app and Celery worker
"""

import requests
import time
import json

BASE_URL = "http://localhost:5000/api/v1"

def test_upload_resume():
    """Test endpoint 1: Upload resume"""
    print("Testing endpoint 1: Upload resume...")
    
    pdf_url = '/home/kyo/Downloads/1_page_Resume.pdf'
    files = {'resume': open(pdf_url, 'rb')}
    data = {'target_skill': 'Python Developer'}
    
    response = requests.post(f"{BASE_URL}/upload-resume", files=files, data=data)
    files['resume'].close()
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        return response.json()['analysis_id']
    return None

def test_check_status(analysis_id):
    """Test endpoint 2: Check analysis status"""
    print(f"\nTesting endpoint 2: Check status for {analysis_id}...")
    
    for i in range(20):  # Poll for up to 10 times
        response = requests.get(f"{BASE_URL}/status/{analysis_id}")
        print(f"Status check {i+1}: {response.json()}")
        
        if response.json().get('status') == 'completed':
            return True
        elif response.json().get('status') == 'failed':
            return False
        
        time.sleep(2)  # Wait 2 seconds between checks
    
    return False

def test_get_skills(analysis_id):
    """Test endpoint 3: Get recommended skills"""
    print(f"\nTesting endpoint 3: Get skills for {analysis_id}...")
    
    response = requests.get(f"{BASE_URL}/skills/{analysis_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json()['recommended_skills']
    return None

def test_confirm_recommendations(analysis_id, recommended_skills):
    """Test endpoint 4: Confirm recommendations"""
    print(f"\nTesting endpoint 4: Confirm recommendations...")
    
    # Select first 2 skills
    selected_skill_ids = [skill['skill_id'] for skill in recommended_skills[:2]]
    
    data = {
        "analysis_id": analysis_id,
        "selected_skill_ids": selected_skill_ids,
        "preferences": {
            "weekly_hours": 10,
            "target_duration_months": 6,
            "learning_style": "project_based"
        }
    }
    
    response = requests.post(f"{BASE_URL}/confirm-recommendations", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 202:
        return response.json()['roadmap_job_id']
    return None

def test_roadmap_status(roadmap_job_id):
    """Test endpoint 5: Check roadmap generation status"""
    print(f"\nTesting endpoint 5: Check roadmap status for {roadmap_job_id}...")
    
    for i in range(10):  # Poll for up to 10 times
        response = requests.get(f"{BASE_URL}/roadmap/status/{roadmap_job_id}")
        print(f"Roadmap status check {i+1}: {response.json()}")
        
        if response.json().get('status') == 'completed':
            return response.json().get('roadmap_id')
        elif response.json().get('status') == 'failed':
            return False
        
        time.sleep(2)  # Wait 2 seconds between checks
    
    return None

def test_get_roadmap(roadmap_id):
    """Test endpoint 6: Get roadmap"""
    print(f"\nTesting endpoint 6: Get roadmap {roadmap_id}...")
    
    response = requests.get(f"{BASE_URL}/roadmaps/{roadmap_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def main():
    print("Testing SkillBridge API Endpoints 1-6")
    print("=====================================")
    
    # Test the full workflow
    analysis_id = test_upload_resume()
    if not analysis_id:
        print("Failed to upload resume")
        return
    
    # Wait for analysis to complete
    if not test_check_status(analysis_id):
        print("Analysis failed or timed out")
        return
    
    # Get recommended skills
    recommended_skills = test_get_skills(analysis_id)
    if not recommended_skills:
        print("Failed to get recommended skills")
        return
    
    # Confirm recommendations
    roadmap_job_id = test_confirm_recommendations(analysis_id, recommended_skills)
    if not roadmap_job_id:
        print("Failed to confirm recommendations")
        return
    
    # Wait for roadmap generation
    roadmap_id = test_roadmap_status(roadmap_job_id)
    if not roadmap_id:
        print("Roadmap generation failed or timed out")
        return
    
    # Get final roadmap
    test_get_roadmap(roadmap_id)
    
    print("\n✅ All endpoints tested successfully!")

if __name__ == "__main__":
    main()