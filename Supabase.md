# Supabase Notes Integration — Project Context

## ✅ Supabase Schema Setup (Completed)

### `notes` Table (Created Manually in Supabase)

| Column       | Type      | Notes                                      |
|--------------|-----------|--------------------------------------------|
| id           | UUID      | Primary Key. Default: `gen_random_uuid()` |
| user_id      | UUID      | References `auth.users.id`                |
| first_name   | Text      | Pulled from `auth.users.user_metadata`    |
| email        | Text      | Pulled from `auth.users.email`            |
| title        | Text      | User-entered note title                   |
| content      | Text      | User-entered note content                 |
| created_at   | Timestamp | Default: `now()`                          |
| updated_at   | Timestamp | Auto-updated via trigger on row update    |

### ✅ Trigger (Created)

Automatically sets `updated_at` to `now()` on update.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

Step-by-step: Add Supabase Notes integration to my React Native app

1. Set up Supabase client with correct project URL and anon key (if not already done).

2. Create a Supabase helper module for notes (e.g., `supabaseNotes.ts`) with these functions:
   - `addNote(note: { title: string, content: string, first_name: string, email: string })`
   - `updateNote(noteId: string, updatedFields: Partial<Note>)`
   - `getUserNotes()`: fetch all notes where `user_id = auth.uid()`
   - `deleteNote(noteId: string)`

3. In the NoteEditScreen:
   - If a note is new, call `addNote()` and let Supabase auto-generate the ID.
   - If a note already exists (has a valid UUID), call `updateNote()` when navigating away or pressing save.

4. Make sure `user_id`, `first_name`, and `email` are passed to Supabase when saving a note.
   - Use `supabase.auth.getUser()` to retrieve them on login.

5. Use the existing Zustand or Context state management to track the current note and sync changes with Supabase.

6. On app launch or dashboard load, fetch all notes using `getUserNotes()` and display them.

7. Confirm new notes appear in Supabase and can be updated/deleted reliably.

This should enable full sync between app and Supabase for note creation, updates, and retrieval.