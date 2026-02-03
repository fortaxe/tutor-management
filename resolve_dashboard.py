
import re

file_path = 'client/pages/GymOwnerDashboard.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Pattern for conflicts
# <<<<<<< HEAD
# (HEAD CONTENT)
# =======
# (INCOMING CONTENT)
# >>>>>>> ID

def resolve_conflict(match):
    full_block = match.group(0)
    head_content = match.group(1)
    incoming_content = match.group(2)
    
    # Conflict 1: MemberRow
    if "const MemberRow" in incoming_content and not head_content.strip():
        # Keep HEAD (Empty)
        return ""
    
    # Conflict 2: Stats
    if "const expiredMembers =" in head_content and "const activeMembers =" in incoming_content:
        # Keep HEAD
        return head_content
        
    # Conflict 3: Filter
    if "remainingDays <= expiryFilter" in head_content:
        # Keep HEAD
        return head_content
        
    # Conflict 4: Renew Modal
    if "setEditingMember(member);" in head_content and "getPlanDates(member);" in incoming_content:
        # Keep Incoming
        return incoming_content

    return full_block # Fallback

# Regex to find blocks
# We need DOTALL to match newlines
pattern = r"<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [a-f0-9]+"

resolved_content = re.sub(pattern, resolve_conflict, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(resolved_content)
