---
title: Serena MCP Installation Guide - Complete Troubleshooting
date: 2025-08-14  
meta: Advanced Coding Tool for Claude Code
lang: en
order: 2
---

# Serena MCP Installation Guide: Complete Troubleshooting

## Overview
This document covers all known issues and solutions encountered during Serena MCP installation. It integrates 5 hours of troubleshooting results with content from hansdev.kr blog.

## Key Requirements
1. **web_dashboard: false** - Installation fails without this setting
2. **uv sync** - Dependency installation is mandatory
3. **Global ~/.claude.json** - Must use global settings, not project-specific

## About Serena MCP

Serena MCP is an advanced coding tool for LLMs. Key features:

- **Symbol-based code analysis**: Accurately identifies functions, classes, variables
- **Project structure analysis**: Understands file dependencies and relationships
- **Efficient code modification**: Minimizes token usage while modifying only necessary parts
- **Multi-language support**: Python, TypeScript, JavaScript, Go, Rust, Ruby, Swift

### MCP (Model Context Protocol)
A protocol developed by Anthropic that enables AI models to communicate with external tools. Claude Code's file system access, web search, etc. are implemented through MCP.

## Correct Installation Procedure

### Prerequisites

#### macOS/Linux
```bash
# Check Python 3.8+
python3 --version

# Check Git
git --version

# Install uv (Python package manager)
# Using Homebrew (macOS)
brew install uv

# Or official installation script (Linux/macOS)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installation
uv --version
```

### Step 1: Remove Existing Installation
```bash
# Check and terminate running processes
ps aux | grep serena
# kill [PID]

# Remove uv tools
uv tool uninstall serena-agent 2>/dev/null || echo "Not installed"

# Delete configuration files
rm -rf ~/.serena
rm -rf .serena

# Delete executables
rm -f ~/.local/bin/serena*

# Clear cache
find ~/.local/share/uv -name "*serena*" -exec rm -rf {} + 2>/dev/null

# Remove existing clones
rm -rf ~/work/serena
```

### Step 2: Local Installation
```bash
# Create working directory
mkdir -p ~/work
cd ~/work

# Clone latest version from GitHub
git clone https://github.com/oraios/serena
cd serena

# Important: Install dependencies (required)
uv sync

# Verify success message (55 packages installed)
# Installed 55 packages in XXXms
```

### Step 3: Configure Settings
```bash
# Create configuration directory
mkdir -p ~/.serena

# Copy template
cp src/serena/resources/serena_config.template.yml ~/.serena/serena_config.yml

# Required: Disable web dashboard
sed -i 's/web_dashboard: True/web_dashboard: false/g' ~/.serena/serena_config.yml
sed -i 's/web_dashboard_open_on_launch: True/web_dashboard_open_on_launch: false/g' ~/.serena/serena_config.yml

# Or manually edit:
# web_dashboard: false
# web_dashboard_open_on_launch: false
```

### Step 4: Configure Claude
Create and run the setup script to configure Claude automatically.

### Step 5: Verify and Restart Claude
```bash
# Verify configuration
grep -A 10 '"serena"' ~/.claude.json

# Test JSON-RPC
cd ~/work/serena
echo '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{}},"id":1}' | \
  uv run serena-mcp-server --context ide-assistant 2>/dev/null | head -5

# Restart Claude
# Exit with Ctrl+C or /exit
claude --resume

# Check MCP status
/mcp
# Verify "serena: Connected" is displayed
```

## Verification

Successful installation displays:
```
Serena MCP Server
Status: Connected
Command: uv
Args: run --directory /home/...
```

## Usage

After installation:
```
/mcp__serena__initial_instructions
```

Key features:
- **Symbol search**: Accurately search for functions or classes
- **Find references**: Identify where specific functions are used
- **Code modification**: Token-efficient partial modifications
- **Project memory**: Manage per-project context

## Key Guidelines

### Prohibited Actions
1. Don't use `uvx --from serena-agent`
2. Don't use `serena start-mcp-server` (starts web dashboard)
3. Don't use PyPI packages (outdated)
4. Don't set project-specific .claude.json
5. Don't set `web_dashboard: True`
6. Don't skip `uv sync`

### Required Actions
1. Clone directly from GitHub
2. Install dependencies with `uv sync`
3. Set `web_dashboard: false`
4. Use `uv run --directory`
5. Configure global ~/.claude.json
6. Remove duplicate configurations

## Conclusion

Serena MCP is a powerful tool, but web dashboard settings and dependency installation are critical for installation success.

**Essential checks:**
1. `web_dashboard: false`
2. Run `uv sync`
3. Use global settings

Following this guide precisely will ensure successful installation.