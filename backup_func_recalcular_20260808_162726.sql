                                                                    pg_get_functiondef                                                                     
-----------------------------------------------------------------------------------------------------------------------------------------------------------
 CREATE OR REPLACE FUNCTION public.recalcular_next_exercise_id(p_user_id uuid)                                                                            +
  RETURNS uuid                                                                                                                                            +
  LANGUAGE plpgsql                                                                                                                                        +
 AS $function$                                                                                                                                            +
 DECLARE                                                                                                                                                  +
     v_user record;                                                                                                                                       +
     v_next_id uuid := NULL;                                                                                                                              +
     v_tentativas_seguidas_topico integer := 0;                                                                                                           +
     v_ineditos_restantes_nivel integer := 0;                                                                                                             +
     v_ultimo_exercicio text;                                                                                                                             +
 BEGIN                                                                                                                                                    +
     SELECT * INTO v_user FROM public.users WHERE id = p_user_id;                                                                                         +
     IF v_user.id IS NULL THEN RETURN NULL; END IF;                                                                                                       +
                                                                                                                                                          +
     SELECT exercicios_concluidos[array_length(exercicios_concluidos, 1)]::text                                                                           +
     INTO v_ultimo_exercicio                                                                                                                              +
     FROM public.users WHERE id = p_user_id;                                                                                                              +
                                                                                                                                                          +
     SELECT COUNT(*) INTO v_ineditos_restantes_nivel                                                                                                      +
     FROM public.exercises e                                                                                                                              +
     WHERE (e.level::text = v_user.current_level::text OR e.level::text = v_user.target_level::text)                                                      +
       AND (v_user.exercicios_concluidos IS NULL OR NOT (e.id::text = ANY(v_user.exercicios_concluidos::text[])));                                        +
                                                                                                                                                          +
     IF v_ineditos_restantes_nivel = 0 THEN                                                                                                               +
         SELECT e.id INTO v_next_id                                                                                                                       +
         FROM public.exercises e                                                                                                                          +
         WHERE (e.level::text = v_user.current_level::text OR e.level::text = v_user.target_level::text)                                                  +
           AND (v_ultimo_exercicio IS NULL OR e.id::text <> v_ultimo_exercicio)                                                                           +
         ORDER BY RANDOM()                                                                                                                                +
         LIMIT 1;                                                                                                                                         +
                                                                                                                                                          +
         UPDATE public.users SET next_exercise_id = v_next_id WHERE id = p_user_id;                                                                       +
         RETURN v_next_id;                                                                                                                                +
     END IF;                                                                                                                                              +
                                                                                                                                                          +
     IF v_user.topico_deficitario IS NOT NULL AND v_user.topico_deficitario <> '' THEN                                                                    +
         SELECT COUNT(*) INTO v_tentativas_seguidas_topico                                                                                                +
         FROM (SELECT skill_code FROM public.user_ia_decisions                                                                                            +
               WHERE user_id::text = p_user_id::text ORDER BY updated_at DESC LIMIT 3) ultimas                                                            +
         WHERE ultimas.skill_code = v_user.topico_deficitario;                                                                                            +
     END IF;                                                                                                                                              +
                                                                                                                                                          +
     IF v_user.topico_deficitario IS NOT NULL AND v_user.topico_deficitario <> '' AND v_tentativas_seguidas_topico < 2 THEN                               +
         SELECT e.id INTO v_next_id                                                                                                                       +
         FROM public.exercises e                                                                                                                          +
         WHERE (e.skill_code = v_user.topico_deficitario OR e.exercise_topic = v_user.topico_deficitario)                                                 +
           AND (e.level::text = v_user.current_level::text OR e.level::text = v_user.target_level::text)                                                  +
           AND (e.unit_id::text = v_user.current_unit_id::text OR e.unit::text = v_user.modulo_atual::text)                                               +
           AND (v_user.exercicios_concluidos IS NULL OR NOT (e.id::text = ANY(v_user.exercicios_concluidos::text[])))                                     +
         ORDER BY e.ordem ASC NULLS LAST LIMIT 1;                                                                                                         +
     END IF;                                                                                                                                              +
                                                                                                                                                          +
     IF v_next_id IS NULL THEN                                                                                                                            +
         SELECT e.id INTO v_next_id                                                                                                                       +
         FROM public.exercises e                                                                                                                          +
         WHERE (e.unit_id::text = v_user.current_unit_id::text OR e.unit::text = v_user.current_unit_id::text OR e.unit::text = v_user.modulo_atual::text)+
           AND (e.level::text = v_user.current_level::text OR e.level::text = v_user.target_level::text)                                                  +
           AND (v_user.exercicios_concluidos IS NULL OR NOT (e.id::text = ANY(v_user.exercicios_concluidos::text[])))                                     +
         ORDER BY e.ordem ASC NULLS LAST, e.created_at ASC LIMIT 1;                                                                                       +
     END IF;                                                                                                                                              +
                                                                                                                                                          +
     IF v_next_id IS NULL THEN                                                                                                                            +
         SELECT e.id INTO v_next_id                                                                                                                       +
         FROM public.exercises e                                                                                                                          +
         WHERE (e.level::text = v_user.current_level::text OR e.level::text = v_user.target_level::text)                                                  +
           AND (v_user.exercicios_concluidos IS NULL OR NOT (e.id::text = ANY(v_user.exercicios_concluidos::text[])))                                     +
         ORDER BY e.ordem ASC NULLS LAST, e.created_at ASC LIMIT 1;                                                                                       +
     END IF;                                                                                                                                              +
                                                                                                                                                          +
     UPDATE public.users SET next_exercise_id = v_next_id WHERE id = p_user_id;                                                                           +
     RETURN v_next_id;                                                                                                                                    +
 END;                                                                                                                                                     +
 $function$                                                                                                                                               +
 
(1 row)

