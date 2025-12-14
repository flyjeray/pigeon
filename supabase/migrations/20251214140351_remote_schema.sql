set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.broadcast_new_conversation()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
    perform realtime.broadcast_changes(
      'user:' || coalesce(NEW.user_two, OLD.user_two) ::text,
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );

    return null;
end;$function$
;


