Error: data visible in Table Editor, but select returns empty array, no error
Cause: no SELECT policy on the table. RLS default-deny returns 0 rows silently.
Fix: create a select policy
Check: select policyname, cmd, qual from pg_policies where tablename = 'x';
Lesson: insert violations error loudly, select violations return nothing quietly.

