import math
import re
from typing import List, Dict, Any, Set
from app.utils.skill_normalizer import normalize_skill, normalize_skill_list


def calculate_match_score(
    candidate_skills: List[str],
    candidate_experience_years: float,
    candidate_text: str,
    required_skills: List[str],
    preferred_skills: List[str],
    experience_required: int,
    job_description: str,
) -> Dict[str, Any]:
    """
    Deterministic ATS scoring algorithm:
    Skill Alignment: 60%
    Experience Fit: 20%
    Keyword & Relevance: 20%
    Final Score = (Skill Score * 0.60) + (Experience Score * 0.20) + (Relevance Score * 0.20)
    Normalized between 0 and 100.
    """
    # 1. Normalize skill sets
    norm_candidate = set(s.lower() for s in normalize_skill_list(candidate_skills))
    norm_required = [normalize_skill(s) for s in required_skills if s.strip()]
    norm_preferred = [normalize_skill(s) for s in preferred_skills if s.strip()]

    matched_skills = []
    missing_skills = []

    # Check required skills (heavier weight)
    req_matches = 0
    for req in norm_required:
        if req.lower() in norm_candidate:
            req_matches += 1
            matched_skills.append(req)
        else:
            missing_skills.append(req)

    # Check preferred skills (bonus)
    pref_matches = 0
    for pref in norm_preferred:
        if pref.lower() in norm_candidate:
            pref_matches += 1
            if pref not in matched_skills:
                matched_skills.append(pref)

    # Compute Skill Score (0 - 100)
    total_req = len(norm_required)
    total_pref = len(norm_preferred)

    if total_req == 0 and total_pref == 0:
        skill_score = 80.0
    elif total_req == 0:
        skill_score = min(100.0, (pref_matches / total_pref) * 100.0)
    else:
        req_ratio = req_matches / total_req
        pref_ratio = (pref_matches / total_pref) if total_pref > 0 else 0.0
        # 85% weight to required, 15% to preferred
        skill_score = min(100.0, (req_ratio * 85.0) + (pref_ratio * 15.0))

    # 2. Compute Experience Score (0 - 100)
    if experience_required <= 0:
        exp_score = 100.0
    else:
        cand_exp = max(0.0, float(candidate_experience_years))
        if cand_exp >= experience_required:
            exp_score = 100.0
        else:
            # Proportional score
            exp_score = min(100.0, (cand_exp / experience_required) * 100.0)

    # 3. Keyword & Relevance Score (0 - 100)
    # Tokenize candidate profile & job description text
    clean_desc = re.sub(r'[^a-zA-Z0-9\s]', ' ', job_description.lower())
    desc_words = set(w for w in clean_desc.split() if len(w) > 3)
    
    clean_cand = re.sub(r'[^a-zA-Z0-9\s]', ' ', (candidate_text + " " + " ".join(candidate_skills)).lower())
    cand_words = set(w for w in clean_cand.split() if len(w) > 3)

    if not desc_words:
        relevance_score = 80.0
    else:
        overlap = desc_words.intersection(cand_words)
        relevance_score = min(100.0, (len(overlap) / min(len(desc_words), 50)) * 100.0)

    # 4. Final Deterministic Score Calculation
    final_score = round(
        (skill_score * 0.60) + (exp_score * 0.20) + (relevance_score * 0.20),
        1
    )
    final_score = max(0.0, min(100.0, final_score))

    # Construct Explanation
    explanation_parts = []
    if final_score >= 80:
        explanation_parts.append(f"Strong fit ({final_score}% match).")
    elif final_score >= 60:
        explanation_parts.append(f"Moderate fit ({final_score}% match).")
    else:
        explanation_parts.append(f"Low alignment ({final_score}% match).")

    explanation_parts.append(f"Matched {len(matched_skills)} skills with {skill_score:.1f}% skill alignment.")
    if candidate_experience_years >= experience_required:
        explanation_parts.append(f"Meets or exceeds the required experience ({candidate_experience_years} yrs vs {experience_required} yrs required).")
    else:
        explanation_parts.append(f"Candidate has {candidate_experience_years} yrs experience ({experience_required} yrs desired).")

    if missing_skills:
        explanation_parts.append(f"Missing key skills: {', '.join(missing_skills[:5])}.")

    return {
        "match_score": final_score,
        "skill_score": round(skill_score, 1),
        "experience_score": round(exp_score, 1),
        "relevance_score": round(relevance_score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "explanation": " ".join(explanation_parts),
    }

