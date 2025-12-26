drop policy "insert only for participants" on "public"."messages";

drop policy "Enable insert for authenticated users only" on "public"."private_keys";

drop policy "Enable insert for authenticated users only" on "public"."public_keys";

drop policy "Enable read access for all users" on "public"."users";


  create policy "insert only for participants and only as own messages "
  on "public"."messages"
  as permissive
  for insert
  to public
with check (((sender = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.user_one = auth.uid()) OR (c.user_two = auth.uid())))))));



  create policy "Enable insert for users based on user_id"
  on "public"."private_keys"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for users based on user_id"
  on "public"."public_keys"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable read access for authenticated users"
  on "public"."users"
  as permissive
  for select
  to authenticated
using (true);



