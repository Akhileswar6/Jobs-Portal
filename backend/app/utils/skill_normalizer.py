import re
from typing import List, Set

NORMALIZATION_MAP = {
    # JavaScript & TypeScript
    "reactjs": "React",
    "react.js": "React",
    "react native": "React Native",
    "reactnative": "React Native",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node": "Node.js",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "expressjs": "Express",
    "express.js": "Express",
    "express": "Express",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "vue": "Vue.js",
    "angularjs": "Angular",
    "angular": "Angular",
    
    # Python & Data
    "py": "Python",
    "python": "Python",
    "python3": "Python",
    "fastapi": "FastAPI",
    "fast-api": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "numpy": "NumPy",
    "pandas": "Pandas",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    
    # Java & C / C++ / C#
    "java": "Java",
    "spring": "Spring",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    ".net": ".NET",
    "dotnet": ".NET",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    
    # Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "sql": "SQL",
    "nosql": "NoSQL",
    
    # Cloud & DevOps
    "amazon web services": "AWS",
    "aws": "AWS",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "gcp": "GCP",
    "azure": "Microsoft Azure",
    "microsoft azure": "Microsoft Azure",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "terraform": "Terraform",
    "git": "Git",
    "github": "GitHub",
    
    # Web & UI
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "sass": "Sass",
    "scss": "Sass",
    
    # AI / ML & GenAI
    "genai": "Generative AI",
    "generative ai": "Generative AI",
    "llm": "LLMs",
    "llms": "LLMs",
    "gemini": "Google Gemini",
    "gemini api": "Google Gemini",
}


def normalize_skill(skill: str) -> str:
    """Normalize a skill name to standard casing/synonym."""
    if not skill:
        return ""
    clean = skill.strip()
    key = clean.lower()
    return NORMALIZATION_MAP.get(key, clean)


def normalize_skill_list(skills: List[str]) -> List[str]:
    """Normalize and deduplicate a list of skills."""
    normalized: Set[str] = set()
    result: List[str] = []
    
    for s in skills:
        if not s or not s.strip():
            continue
        norm = normalize_skill(s.strip())
        if norm.lower() not in [n.lower() for n in normalized]:
            normalized.add(norm)
            result.append(norm)
            
    return result

