#!/usr/bin/env python3
"""
Example usage of the PDF Resume Parser for SkillBridge.
Simplified version that only extracts raw PDF content.
"""

import json
import sys
import os
from pathlib import Path

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from resume_parser.main import ResumeParser


def main():
    """Main example function."""
    
    # Example: Basic PDF content extraction
    print("=== SkillBridge PDF Content Extractor Example ===\n")
    
    # Initialize parser
    parser = ResumeParser()
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        print(f"Processing PDF: {pdf_path}")
        
        try:
            # Extract LLM-optimized content
            result = parser.extract_pdf_content_for_llm(pdf_path)
            
            parsed_data = json.loads(result)
            print("=== LLM-Ready Data ===")
            print(json.dumps(parsed_data, indent=2))
            
        except Exception as e:
            print(f"Error processing PDF: {e}")
    
    else:
        pdf_path = '/home/kyo/Downloads/1_page_Resume.pdf'
        print(f"Processing PDF: {pdf_path}")
        
        try:
            # Extract LLM-optimized content
            result = parser.extract_pdf_content_for_llm(pdf_path)
            parsed_data = json.loads(result)
            print("=== LLM-Ready Data ===")
            print(json.dumps(parsed_data, indent=2))
        except Exception as e:
            print(f"Error processing PDF: {e}")


if __name__ == "__main__":
    main()