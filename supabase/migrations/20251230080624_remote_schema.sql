alter table "public"."conversations" drop constraint "conversations_user_one_fkey";

alter table "public"."conversations" drop constraint "conversations_user_two_fkey";

alter table "public"."conversations" add constraint "conversations_user_one_fkey" FOREIGN KEY (user_one) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_user_one_fkey";

alter table "public"."conversations" add constraint "conversations_user_two_fkey" FOREIGN KEY (user_two) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_user_two_fkey";


