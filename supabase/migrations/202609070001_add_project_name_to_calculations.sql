alter table public.calculations
  add column project_name text not null default 'Projeto sem nome';

alter table public.calculations
  alter column project_name drop default;

alter table public.calculations
  add constraint calculations_project_name_not_blank
  check (char_length(btrim(project_name)) > 0);
