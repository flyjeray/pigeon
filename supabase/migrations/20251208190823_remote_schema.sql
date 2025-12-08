drop extension if exists "pg_net";


  create table "public"."conversations" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_one" uuid default auth.uid(),
    "user_two" uuid
      );


alter table "public"."conversations" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "sender" uuid not null default auth.uid(),
    "contents" text not null,
    "conversation_id" uuid not null
      );


alter table "public"."messages" enable row level security;


  create table "public"."private_keys" (
    "user_id" uuid not null default auth.uid(),
    "encoded_key" text not null,
    "recipe" json not null
      );


alter table "public"."private_keys" enable row level security;


  create table "public"."public_keys" (
    "user_id" uuid not null default auth.uid(),
    "key" text not null
      );


alter table "public"."public_keys" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "email" text
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX private_keys_pkey ON public.private_keys USING btree (user_id);

CREATE UNIQUE INDEX public_keys_pkey ON public.public_keys USING btree (user_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."private_keys" add constraint "private_keys_pkey" PRIMARY KEY using index "private_keys_pkey";

alter table "public"."public_keys" add constraint "public_keys_pkey" PRIMARY KEY using index "public_keys_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."conversations" add constraint "conversations_user_one_fkey" FOREIGN KEY (user_one) REFERENCES auth.users(id) not valid;

alter table "public"."conversations" validate constraint "conversations_user_one_fkey";

alter table "public"."conversations" add constraint "conversations_user_two_fkey" FOREIGN KEY (user_two) REFERENCES auth.users(id) not valid;

alter table "public"."conversations" validate constraint "conversations_user_two_fkey";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$function$
;

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."private_keys" to "anon";

grant insert on table "public"."private_keys" to "anon";

grant references on table "public"."private_keys" to "anon";

grant select on table "public"."private_keys" to "anon";

grant trigger on table "public"."private_keys" to "anon";

grant truncate on table "public"."private_keys" to "anon";

grant update on table "public"."private_keys" to "anon";

grant delete on table "public"."private_keys" to "authenticated";

grant insert on table "public"."private_keys" to "authenticated";

grant references on table "public"."private_keys" to "authenticated";

grant select on table "public"."private_keys" to "authenticated";

grant trigger on table "public"."private_keys" to "authenticated";

grant truncate on table "public"."private_keys" to "authenticated";

grant update on table "public"."private_keys" to "authenticated";

grant delete on table "public"."private_keys" to "service_role";

grant insert on table "public"."private_keys" to "service_role";

grant references on table "public"."private_keys" to "service_role";

grant select on table "public"."private_keys" to "service_role";

grant trigger on table "public"."private_keys" to "service_role";

grant truncate on table "public"."private_keys" to "service_role";

grant update on table "public"."private_keys" to "service_role";

grant delete on table "public"."public_keys" to "anon";

grant insert on table "public"."public_keys" to "anon";

grant references on table "public"."public_keys" to "anon";

grant select on table "public"."public_keys" to "anon";

grant trigger on table "public"."public_keys" to "anon";

grant truncate on table "public"."public_keys" to "anon";

grant update on table "public"."public_keys" to "anon";

grant delete on table "public"."public_keys" to "authenticated";

grant insert on table "public"."public_keys" to "authenticated";

grant references on table "public"."public_keys" to "authenticated";

grant select on table "public"."public_keys" to "authenticated";

grant trigger on table "public"."public_keys" to "authenticated";

grant truncate on table "public"."public_keys" to "authenticated";

grant update on table "public"."public_keys" to "authenticated";

grant delete on table "public"."public_keys" to "service_role";

grant insert on table "public"."public_keys" to "service_role";

grant references on table "public"."public_keys" to "service_role";

grant select on table "public"."public_keys" to "service_role";

grant trigger on table "public"."public_keys" to "service_role";

grant truncate on table "public"."public_keys" to "service_role";

grant update on table "public"."public_keys" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Enable insert for authenticated users only"
  on "public"."conversations"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = user_one) OR (auth.uid() = user_two)));



  create policy "Enable users to view their own data only"
  on "public"."conversations"
  as permissive
  for select
  to authenticated
using (((( SELECT auth.uid() AS uid) = user_one) OR (( SELECT auth.uid() AS uid) = user_two)));



  create policy "conversation_participant_delete"
  on "public"."messages"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.user_one = ( SELECT auth.uid() AS uid)) OR (c.user_two = ( SELECT auth.uid() AS uid)))))));



  create policy "conversation_participant_select"
  on "public"."messages"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.user_one = ( SELECT auth.uid() AS uid)) OR (c.user_two = ( SELECT auth.uid() AS uid)))))));



  create policy "insert only for participants"
  on "public"."messages"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.user_one = ( SELECT auth.uid() AS uid)) OR (c.user_two = ( SELECT auth.uid() AS uid)))))));



  create policy "Enable insert for authenticated users only"
  on "public"."private_keys"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable users to view their own data only"
  on "public"."private_keys"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."public_keys"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."public_keys"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable read access for all users"
  on "public"."users"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


