import re

class ValidationError(Exception):
    """Custom validation error exception."""
    pass

def validate_zetech_email(email):
    """
    Validate that email is from Zetech University domain.
    
    Args:
        email (str): Email address to validate
        
    Returns:
        bool: True if valid Zetech email, False otherwise
        
    Raises:
        ValidationError: If email is not from @zetech.ac.ke domain
    """
    if not email or not isinstance(email, str):
        raise ValidationError("Email must be a valid string")
    
    email = email.lower().strip()
    
    if not email.endswith("@zetech.ac.ke"):
        raise ValidationError("Access Denied. Only Zetech University students are permitted.")
    
    # Basic email format validation
    pattern = r'^[a-zA-Z0-9._%+-]+@zetech\.ac\.ke$'
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")
    
    return True

def validate_student_id(student_id):
    """
    Validate Zetech admission number format.
    
    Pattern: [COURSE CODE]-[LEVEL]-[NUMBER]/[YEAR]
    Examples: BIT-01-1234/2024, BED-05-0672/2024, DCS-02-5678/2023
    
    Args:
        student_id (str): Student ID to validate
        
    Returns:
        tuple: (is_valid, course_code, level, number, year)
        
    Raises:
        ValidationError: If student_id doesn't match pattern
    """
    if not student_id or not isinstance(student_id, str):
        raise ValidationError("Student ID must be a valid string")
    
    student_id = student_id.upper().strip()
    
    # Pattern: ^[A-Z]{2,4}-\d{2}-\d{4}/\d{4}$
    pattern = r'^([A-Z]{2,4})-(\d{2})-(\d{4})/(\d{4})$'
    match = re.match(pattern, student_id)
    
    if not match:
        raise ValidationError(
            "Invalid student ID format. Expected format: BIT-01-1234/2024 or DCS-02-5678/2023"
        )
    
    course_code, level, number, year = match.groups()
    
    # Validate year is reasonable (1990 - 2100)
    year_int = int(year)
    if year_int < 1990 or year_int > 2100:
        raise ValidationError("Invalid year in student ID")
    
    return {
        'student_id': student_id,
        'course_code': course_code,
        'level': int(level),
        'number': number,
        'year': year_int
    }

def extract_department_from_student_id(student_id):
    """
    Extract department/course code from student ID.
    
    Args:
        student_id (str): Valid student ID
        
    Returns:
        str: Department code (e.g., 'BIT', 'DCS', 'BED')
    """
    try:
        validated = validate_student_id(student_id)
        return validated['course_code']
    except ValidationError:
        return None

def validate_password(password):
    """
    Validate password strength - Google-style simple validation.
    
    Requirements:
    - At least 8 characters (simple and user-friendly like Google)
    
    Args:
        password (str): Password to validate
        
    Returns:
        bool: True if password meets minimum requirements
        
    Raises:
        ValidationError: If password doesn't meet requirements
    """
    if not password or not isinstance(password, str):
        raise ValidationError("Password must be a valid string")
    
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long")
    
    return True
