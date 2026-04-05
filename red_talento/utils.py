# Funcion para calcular los alumnos que mas conectan con la oferta

def score(estudiante, oferta):
    total = 0
    if estudiante.especialidad == oferta.especialidad_requerida:
        total += 35
    if oferta.disponibilidad_requerida:
        dispo_estudiante = estudiante.disponibilidad.values_list('disponibilidad', flat=True)
        if oferta.disponibilidad_requerida in dispo_estudiante:
            total += 20
    habilidades_aprv = estudiante.habilidades_set.filter(estado='Aprobado').values_list('nombre', flat=True)
    habilidades_req = oferta.habilidades_requeridas.values_list('habilidad', flat=True)
    if habilidades_req:
        norm_estudiantes = [x.lower() for x in habilidades_aprv]
        norm_oferta = [x.lower() for x in habilidades_req]

        match = [i for i in norm_estudiantes if i in norm_oferta]

        total += (len(match) / len(norm_oferta)) * 30
    
    if estudiante.grado == oferta.grado_requerido:
        total += 10

    if estudiante.video_pitch and estudiante.evidencia_set.exists() and habilidades_aprv:
        total += 5
    return total

    