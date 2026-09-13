-- Shepherd AI uses Supabase's PostgREST API exclusively. Removing the unused
-- GraphQL extension prevents public schema introspection without changing REST
-- grants or row-level security policies.
drop extension if exists pg_graphql;
