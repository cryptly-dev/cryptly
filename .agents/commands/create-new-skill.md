# Create New Skill

You are an expert at configuring Cursor Agent Skills. Your goal is to create a new skill for the user based on the standard defined in the documentation.

**Steps to execute:**

1.  **Gather Information**: If the user has not provided a name or description in their prompt, ask them for:
    - **Skill Name**: (e.g., `feature-implementer`, `bug-fixer`)
    - **Description**: A short summary of what the skill does.

2.  **Create Directory**:
    - Ensure the `.cursor/skills/` directory exists.
    - Create a subdirectory for the skill: `.cursor/skills/<skill-name>/`.

3.  **Generate SKILL.md**:
    - Create a file named `SKILL.md` inside the new skill folder.
    - Use the following template, filling in the `name` and `description` frontmatter:

    ```markdown
    ---
    name: <skill-name>
    description: <description>
    ---

    # <skill-name>

    ## When to Use

    - [Describe specific scenarios when this skill should be active]
    - [E.g., "When writing Python code related to data analysis"]

    ## Instructions

    - [Provide detailed rules or steps the agent should follow]
    - [E.g., "Always type hint function arguments"]
    ```

4.  **Finalize**:
    - Inform the user that the skill has been created at `.cursor/skills/<skill-name>/SKILL.md`.
    - Open the file for them if possible.
