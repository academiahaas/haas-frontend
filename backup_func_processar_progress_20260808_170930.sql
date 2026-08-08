                                           pg_get_functiondef                                           
--------------------------------------------------------------------------------------------------------
 CREATE OR REPLACE FUNCTION public.processar_resposta_user_unit_progress()                             +
  RETURNS trigger                                                                                      +
  LANGUAGE plpgsql                                                                                     +
  SECURITY DEFINER                                                                                     +
 AS $function$\r                                                                                       +
 BEGIN\r                                                                                               +
     IF NEW.user_id IS NOT NULL AND NEW.exercise_id IS NOT NULL AND NEW.exercise_id <> '' THEN\r       +
         UPDATE public.users\r                                                                         +
         SET \r                                                                                        +
             exercicios_concluidos = array_append(\r                                                   +
                 array_remove(COALESCE(exercicios_concluidos, '{}'::text[]), NEW.exercise_id::text), \r+
                 NEW.exercise_id::text\r                                                               +
             ),\r                                                                                      +
             unit_xp = COALESCE(unit_xp::integer, 0) + COALESCE(NEW.score, NEW.unit_xp, 0),\r          +
             total_xp = COALESCE(total_xp, 0) + COALESCE(NEW.score, NEW.unit_xp, 0)\r                  +
         WHERE id = NEW.user_id;\r                                                                     +
 \r                                                                                                    +
         -- Força recálculo do próximo exercício\r                                                     +
         PERFORM public.recalcular_next_exercise_id(NEW.user_id);\r                                    +
     END IF;\r                                                                                         +
 \r                                                                                                    +
     RETURN NEW;\r                                                                                     +
 END;\r                                                                                                +
 $function$                                                                                            +
 
(1 row)

