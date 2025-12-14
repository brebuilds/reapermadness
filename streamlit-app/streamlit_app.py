"""
REAPER Knowledge Chat - Streamlit Interface
A beautiful chat interface for querying REAPER DAW knowledge.
"""

import streamlit as st
import json
from pathlib import Path
from typing import Optional
import re

# Page config
st.set_page_config(
    page_title="REAPER Knowledge Chat",
    page_icon="🎛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        background: linear-gradient(90deg, #FF6B6B, #4ECDC4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    .topic-button {
        background-color: #f0f2f6;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 0.5rem 1rem;
        margin: 0.25rem;
        cursor: pointer;
    }
    .topic-button:hover {
        background-color: #e0e2e6;
    }
    .stChatMessage {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Load knowledge base
@st.cache_data
def load_knowledge_base():
    kb_path = Path(__file__).parent / "data" / "reaper-knowledge-base.json"
    if not kb_path.exists():
        # Try alternate location
        kb_path = Path(__file__).parent.parent / "knowledge-base" / "reaper-knowledge-base.json"
    
    if kb_path.exists():
        with open(kb_path, "r") as f:
            return json.load(f)
    else:
        st.error("Knowledge base not found! Please ensure reaper-knowledge-base.json is in the data folder.")
        return None

kb = load_knowledge_base()

def search_knowledge(query: str) -> str:
    """Search the knowledge base for relevant information."""
    if not kb:
        return "Knowledge base not loaded."
    
    query_lower = query.lower()
    results = []
    
    # Keyword mapping to sections
    keyword_sections = {
        "price": ("pricing", kb.get("pricing", {})),
        "cost": ("pricing", kb.get("pricing", {})),
        "license": ("pricing", kb.get("pricing", {})),
        "feature": ("features", kb.get("features", {})),
        "plugin": ("plugins", kb.get("plugins", {})),
        "reaplug": ("plugins", kb.get("plugins", {}).get("reaPlugs", {})),
        "jsfx": ("plugins", kb.get("plugins", {}).get("jsfx", {})),
        "extension": ("extensions", kb.get("extensions", {})),
        "sws": ("extensions", kb.get("extensions", {}).get("sws", {})),
        "reapack": ("extensions", kb.get("extensions", {}).get("reaPack", {})),
        "playtime": ("extensions", kb.get("extensions", {}).get("playtime2", {})),
        "realearn": ("extensions", kb.get("extensions", {}).get("reaLearn", {})),
        "script": ("scripting", kb.get("scripting", {})),
        "lua": ("scripting", kb.get("scripting", {})),
        "theme": ("themes", kb.get("themes", {})),
        "shortcut": ("shortcuts", kb.get("shortcuts", {})),
        "keyboard": ("shortcuts", kb.get("shortcuts", {})),
        "hotkey": ("shortcuts", kb.get("shortcuts", {})),
        "loop": ("liveLooping", kb.get("liveLooping", {})),
        "live": ("liveLooping", kb.get("liveLooping", {})),
        "super8": ("liveLooping", kb.get("liveLooping", {})),
        "perform": ("liveLooping", kb.get("liveLooping", {})),
        "podcast": ("workflows", kb.get("workflows", {}).get("podcast", {})),
        "audiobook": ("workflows", kb.get("workflows", {}).get("audiobook", {})),
        "film": ("workflows", kb.get("workflows", {}).get("filmScoring", {})),
        "video": ("workflows", kb.get("workflows", {}).get("filmScoring", {})),
        "require": ("systemRequirements", kb.get("systemRequirements", {})),
        "system": ("systemRequirements", kb.get("systemRequirements", {})),
        "windows": ("systemRequirements", kb.get("systemRequirements", {}).get("windows", {})),
        "mac": ("systemRequirements", kb.get("systemRequirements", {}).get("macos", {})),
        "linux": ("systemRequirements", kb.get("systemRequirements", {}).get("linux", {})),
        "trouble": ("troubleshooting", kb.get("troubleshooting", {})),
        "problem": ("troubleshooting", kb.get("troubleshooting", {})),
        "issue": ("troubleshooting", kb.get("troubleshooting", {})),
        "latency": ("troubleshooting", kb.get("troubleshooting", {})),
        "learn": ("learningResources", kb.get("learningResources", {})),
        "tutorial": ("learningResources", kb.get("learningResources", {})),
        "resource": ("learningResources", kb.get("learningResources", {})),
    }
    
    # Find matching sections
    matched_sections = set()
    for keyword, (section_name, section_data) in keyword_sections.items():
        if keyword in query_lower:
            matched_sections.add((section_name, json.dumps(section_data, indent=2)))
    
    if matched_sections:
        return "\n\n---\n\n".join([f"**{name}**:\n```json\n{data}\n```" for name, data in matched_sections])
    
    # General search if no keywords matched
    def search_obj(obj, path=""):
        found = []
        if isinstance(obj, str):
            if query_lower in obj.lower():
                found.append(f"{path}: {obj}")
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                found.extend(search_obj(item, f"{path}[{i}]"))
        elif isinstance(obj, dict):
            for key, value in obj.items():
                found.extend(search_obj(value, f"{path}.{key}" if path else key))
        return found
    
    results = search_obj(kb)
    
    if results:
        return "\n\n".join(results[:15])
    else:
        return "I couldn't find specific information about that. Try asking about:\n- Pricing & licensing\n- Features\n- Plugins (ReaPlugs, JSFX)\n- Extensions (SWS, ReaPack, Playtime)\n- Live looping\n- Shortcuts\n- Workflows (podcast, audiobook, film)"

def format_response(section_name: str, data: dict) -> str:
    """Format a section of the knowledge base as readable text."""
    if not data:
        return "No data available for this section."
    
    def dict_to_text(d, indent=0):
        lines = []
        prefix = "  " * indent
        for key, value in d.items():
            if isinstance(value, dict):
                lines.append(f"{prefix}**{key}**:")
                lines.append(dict_to_text(value, indent + 1))
            elif isinstance(value, list):
                lines.append(f"{prefix}**{key}**:")
                for item in value:
                    if isinstance(item, dict):
                        lines.append(dict_to_text(item, indent + 1))
                    else:
                        lines.append(f"{prefix}  - {item}")
            else:
                lines.append(f"{prefix}**{key}**: {value}")
        return "\n".join(lines)
    
    return dict_to_text(data)

# Sidebar
with st.sidebar:
    st.markdown("## 🎛️ Quick Topics")
    
    quick_topics = [
        ("💰 Pricing", "What does REAPER cost?"),
        ("✨ Features", "What are REAPER's main features?"),
        ("🔌 Plugins", "What plugins come with REAPER?"),
        ("🧩 Extensions", "What extensions should I install?"),
        ("🎸 Live Looping", "How do I set up live looping?"),
        ("⌨️ Shortcuts", "What are the essential shortcuts?"),
        ("🎙️ Podcast", "How do I set up for podcast editing?"),
        ("📚 Learning", "Where can I learn REAPER?"),
        ("🔧 Troubleshooting", "Help with common problems"),
    ]
    
    for label, query in quick_topics:
        if st.button(label, key=label, use_container_width=True):
            st.session_state.quick_query = query

    st.markdown("---")
    st.markdown("### About")
    st.markdown("""
    This chat interface queries a comprehensive REAPER knowledge base.
    
    **Data includes:**
    - Core features & pricing
    - All built-in plugins
    - Essential extensions
    - Live looping setups
    - 700+ keyboard shortcuts
    - Workflow guides
    - Troubleshooting tips
    """)

# Main content
st.markdown('<p class="main-header">🎛️ REAPER Knowledge Chat</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Ask anything about REAPER DAW - features, plugins, live looping, workflows, and more!</p>', unsafe_allow_html=True)

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "👋 Hey! I'm your REAPER knowledge assistant. Ask me anything about REAPER DAW - features, plugins, live looping setups, shortcuts, workflows, or troubleshooting. What would you like to know?"}
    ]

# Check for quick query from sidebar
if "quick_query" in st.session_state:
    query = st.session_state.quick_query
    del st.session_state.quick_query
    st.session_state.messages.append({"role": "user", "content": query})
    response = search_knowledge(query)
    st.session_state.messages.append({"role": "assistant", "content": response})

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("Ask about REAPER..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Generate response
    response = search_knowledge(prompt)
    
    # Add assistant response
    st.session_state.messages.append({"role": "assistant", "content": response})
    with st.chat_message("assistant"):
        st.markdown(response)

# Footer
st.markdown("---")
st.markdown(
    "<center><small>Built with ❤️ for REAPER users | Knowledge base v2.0</small></center>",
    unsafe_allow_html=True
)
