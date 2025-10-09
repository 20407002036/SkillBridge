"""
Main entry point for the PDF Resume Parser.
Simplified version for SkillBridge - only handles PDF text extraction.
"""

import json
import sys
import spacy
import base64
import fitz  # PyMuPDF
import unicodedata
import re
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass
from pathlib import Path


# Data models
@dataclass
class LineMetadata:
    """Metadata for a line of text from PDF."""
    text: str
    font_size: float
    is_bold: bool
    page_num: int
    bbox: tuple
    

@dataclass 
class TableInfo:
    """Table information structure."""
    table_id: str
    bbox: tuple
    

# Constants
DEFAULT_HEADER_SIZE_THRESHOLD = 11.0


class PDFExtractor:
    """Extracts text and metadata from PDF files."""
    
    def __init__(self, nlp):
        """Initialize PDF extractor."""
        self.nlp = nlp
    
    def normalize_text(self, text: str) -> str:
        """Normalize text by converting to ASCII and removing extra whitespace."""
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def remove_bullet_points(self, text: str) -> str:
        """Remove common bullet points and dashes from text."""
        text = re.sub(r'[\u2022\u25CF\u2013\u2014\u2023\*•]', '', text).strip()
        text = re.sub(r'[ \t]+', ' ', text)
        return text
    
    def make_serializable(self, obj):
        """Convert PyMuPDF objects to JSON serializable format."""
        if hasattr(obj, '__dict__'):
            # For objects with attributes, convert to dict
            result = {}
            for key, value in obj.__dict__.items():
                result[key] = self.make_serializable(value)
            return result
        elif isinstance(obj, dict):
            # For dictionaries, recursively convert values
            return {key: self.make_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, (list, tuple)):
            # For lists/tuples, recursively convert elements
            return [self.make_serializable(item) for item in obj]
        elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes)):
            # For other iterables (like Rect), convert to list
            try:
                return list(obj)
            except:
                return str(obj)
        else:
            # For primitive types, return as-is
            return obj
    
    def extract(self, pdf_path: str) -> Tuple[List[LineMetadata], float, Dict[str, Any]]:
        """
        Extracts text and associated metadata from a PDF.
        
        Args:
            pdf_path (str): The file path to the PDF resume or base64 encoded data
            
        Returns:
            Tuple containing:
                - List of LineMetadata objects
                - Header size threshold
                - Table registry
        """
        resume_raw_lines_with_metadata = []
        header_size_threshold = DEFAULT_HEADER_SIZE_THRESHOLD
        table_registry = {
            "tables": [],
            "page_table_map": {},
            "links": [],
            "page_link_map": {}
        }

        try:
            # Handle base64 encoded data or file path
            if isinstance(pdf_path, str) and len(pdf_path) > 500:  # Likely base64
                try:
                    decoded_bytes = base64.b64decode(pdf_path)
                    doc = fitz.open(stream=decoded_bytes, filetype="pdf")
                except Exception:
                    doc = fitz.open(pdf_path)
            else:
                doc = fitz.open(pdf_path)

            font_sizes = []

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                
                # Extract tables
                tables = page.find_tables()
                for i, table in enumerate(tables):
                    table_id = f"page_{page_num}_table_{i}"
                    # Convert bbox to tuple if it's a Rect object
                    bbox = tuple(table.bbox) if hasattr(table.bbox, '__iter__') else table.bbox
                    table_info = TableInfo(table_id=table_id, bbox=bbox)
                    table_registry["tables"].append(table_info)
                    
                    if page_num not in table_registry["page_table_map"]:
                        table_registry["page_table_map"][page_num] = []
                    table_registry["page_table_map"][page_num].append(table_info)

                # Extract text with formatting
                blocks = page.get_text("dict")
                
                for block in blocks["blocks"]:
                    if "lines" in block:
                        for line in block["lines"]:
                            line_text = ""
                            line_font_size = 0
                            line_is_bold = False
                            line_bbox = line["bbox"]
                            
                            for span in line["spans"]:
                                span_text = span["text"]
                                span_font_size = span["size"]
                                span_flags = span["flags"]
                                span_is_bold = bool(span_flags & 2**4)
                                
                                line_text += span_text
                                line_font_size = max(line_font_size, span_font_size)
                                line_is_bold = line_is_bold or span_is_bold
                                
                                font_sizes.append(span_font_size)
                            
                            if line_text.strip():
                                # Normalize text
                                normalized_text = self.normalize_text(line_text)
                                cleaned_text = self.remove_bullet_points(normalized_text)
                                
                                line_metadata = LineMetadata(
                                    text=cleaned_text,
                                    font_size=line_font_size,
                                    is_bold=line_is_bold,
                                    page_num=page_num,
                                    bbox=line_bbox
                                )
                                resume_raw_lines_with_metadata.append(line_metadata)

            # Calculate header size threshold
            if font_sizes:
                font_sizes.sort()
                median_font_size = font_sizes[len(font_sizes) // 2]
                header_size_threshold = median_font_size + 1.0

            doc.close()

        except Exception as e:
            print(f"Error extracting PDF: {e}")
            return [], DEFAULT_HEADER_SIZE_THRESHOLD, table_registry

        return resume_raw_lines_with_metadata, header_size_threshold, table_registry


class ResumeParser:
    """Simplified resume parser - only extracts raw PDF content."""
    
    def __init__(self, spacy_model: str = "en_core_web_sm"):
        """
        Initialize the resume parser.
        
        Args:
            spacy_model: SpaCy model to use for NLP processing
        """
        self.spacy_model = spacy_model            
        self.nlp = self._load_spacy_model()
        
        # Initialize only PDF extractor
        self.pdf_extractor = PDFExtractor(self.nlp)
    
    def _load_spacy_model(self):
        """Load SpaCy model."""
        try:
            nlp = spacy.load(self.spacy_model)
            return nlp
        except OSError:
            print(f"SpaCy model '{self.spacy_model}' not found. Downloading...")
            spacy.cli.download(self.spacy_model)
            nlp = spacy.load(self.spacy_model)
            return nlp
        
    def extract_pdf_content(self, pdf_path: str) -> str:
        """
        Extract raw content from PDF with metadata.

        Args:
            pdf_path: The file path to the PDF resume or base64 encoded data

        Returns:
            JSON string containing the extracted raw PDF content and metadata
        """
        # Extract text and metadata from PDF
        resume_raw_lines, header_size_threshold, table_registry = self.pdf_extractor.extract(pdf_path)
        
        if not resume_raw_lines:
            return json.dumps({
                "error": "No text extracted from PDF or error occurred during extraction."
            }, indent=2)

        # Convert to serializable format
        extracted_lines = []
        for line in resume_raw_lines:
            extracted_lines.append({
                "text": line.text,
                "font_size": line.font_size,
                "is_bold": line.is_bold,
                "page_num": line.page_num,
                "bbox": line.bbox
            })

        # Prepare table registry for JSON
        serializable_tables = []
        for table in table_registry["tables"]:
            serializable_tables.append({
                "table_id": table.table_id,
                "bbox": table.bbox
            })

        result_data = {
            "raw_lines": extracted_lines,
            "header_size_threshold": header_size_threshold,
            "table_registry": {
                "tables": serializable_tables,
                "page_table_map": table_registry["page_table_map"],
                "links": table_registry["links"],
                "page_link_map": table_registry["page_link_map"]
            },
            "total_lines": len(extracted_lines),
            "total_pages": max([line.page_num for line in resume_raw_lines], default=0) + 1 if resume_raw_lines else 0
        }
        
        try:
            return json.dumps(result_data, indent=2)
        except TypeError as e:
            print(f"JSON serialization error: {e}")
            print(f"Problematic data types found:")
            for key, value in result_data.items():
                try:
                    json.dumps(value)
                except TypeError:
                    print(f"  - {key}: {type(value)}")
                    if isinstance(value, dict):
                        for subkey, subvalue in value.items():
                            try:
                                json.dumps(subvalue)
                            except TypeError:
                                print(f"    - {key}.{subkey}: {type(subvalue)}")
                    elif isinstance(value, list) and value:
                        print(f"    - {key}[0]: {type(value[0])}")
            raise

    def extract_pdf_content_for_llm(self, pdf_path: str) -> str:
        """
        Extract and clean PDF content specifically for LLM processing.
        Removes irrelevant metadata and focuses on content and formatting.

        Args:
            pdf_path: The file path to the PDF resume or base64 encoded data

        Returns:
            JSON string containing cleaned data optimized for LLM processing
        """
        # First extract all the raw data
        resume_raw_lines, header_size_threshold, table_registry = self.pdf_extractor.extract(pdf_path)
        
        if not resume_raw_lines:
            return json.dumps({
                "error": "No text extracted from PDF or error occurred during extraction."
            }, indent=2)

        # Clean and prepare LLM-optimized data
        cleaned_lines = []
        for line in resume_raw_lines:
            cleaned_lines.append({
                "text": line.text,
                "font_size": line.font_size,
                "is_bold": line.is_bold
            })

        # Create LLM-optimized result
        llm_data = {
            "content": cleaned_lines,
            "total_lines": len(cleaned_lines),
            "document_structure": {
                "has_headers": any(line.is_bold for line in resume_raw_lines),
                "max_font_size": max([line.font_size for line in resume_raw_lines], default=0),
                "min_font_size": min([line.font_size for line in resume_raw_lines], default=0)
            }
        }
        
        return json.dumps(llm_data, indent=2)


# CLI compatibility function
def extract_pdf_content(pdf_path: str) -> str:
    """
    CLI-compatible function for extracting PDF content.
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        JSON string with extracted PDF content and metadata
    """
    parser = ResumeParser()
    return parser.extract_pdf_content(pdf_path)


def extract_pdf_content_for_llm(pdf_path: str) -> str:
    """
    CLI-compatible function for extracting PDF content optimized for LLM.
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        JSON string with cleaned PDF content for LLM processing
    """
    parser = ResumeParser()
    return parser.extract_pdf_content_for_llm(pdf_path)


def main():
    """CLI entry point."""
    if len(sys.argv) > 1:
        function_name = sys.argv[1]
        file_data = sys.stdin.buffer.read()
        if function_name == "extract_pdf_content":
            if len(sys.argv) > 2:
                pdf_path = sys.argv[2]
                print(extract_pdf_content(pdf_path))
            elif file_data:
                print(extract_pdf_content(file_data))
            else:
                print("Error: PDF path argument missing for extract_pdf_content.")
        else:
            print(f"Error: Unknown function '{function_name}'")
    else:
        print("Usage: python main.py <function_name> [args...]")
        print("Available functions: extract_pdf_content")


# For CLI usage
if __name__ == "__main__":
    main()