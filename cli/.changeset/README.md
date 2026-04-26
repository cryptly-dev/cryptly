# Changesets

To describe a CLI change, run `pnpm changeset` from this `cli/` directory and
commit the generated `.md` file alongside the change. The release workflow
picks up pending changesets on merge to `main`, opens (or updates) a
"Version Packages" PR, and publishes to npm when that PR is merged.

Each changeset specifies the bump kind (`patch` / `minor` / `major`) and a
short summary that becomes the changelog entry.
