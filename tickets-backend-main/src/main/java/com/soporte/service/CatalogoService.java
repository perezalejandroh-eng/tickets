package com.soporte.service;

import com.soporte.dto.request.CatalogoRequest;
import com.soporte.dto.response.UsuarioSimpleDTO;
import com.soporte.entity.*;
import com.soporte.exception.BusinessException;
import com.soporte.exception.ResourceNotFoundException;
import com.soporte.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final DependenciaRepository dependenciaRepository;
    private final EdificioRepository edificioRepository;
    private final PisoRepository pisoRepository;
    private final TipoSolicitudRepository tipoSolicitudRepository;
    private final CategoriaServicioRepository categoriaRepository;
    private final SubcategoriaServicioRepository subcategoriaRepository;
    private final ImpactoRepository impactoRepository;
    private final UrgenciaRepository urgenciaRepository;
    private final PrioridadRepository prioridadRepository;
    private final EstatusTicketRepository estatusRepository;
    private final UsuarioRepository usuarioRepository;

    // ── Endpoints públicos (solo activos) ──────────────────────────────────

    public List<Dependencia> getDependencias() {
        return dependenciaRepository.findByActivoTrue();
    }

    public List<Edificio> getEdificios() {
        return edificioRepository.findByActivoTrue();
    }

    public List<Piso> getPisosByEdificio(Long edificioId) {
        return pisoRepository.findByEdificioIdAndActivoTrue(edificioId);
    }

    public List<Piso> getPisos() {
        return pisoRepository.findByActivoTrue();
    }

    public List<TipoSolicitud> getTiposSolicitud() {
        return tipoSolicitudRepository.findByActivoTrue();
    }

    public List<CategoriaServicio> getCategorias() {
        return categoriaRepository.findByActivoTrue();
    }

    public List<SubcategoriaServicio> getSubcategorias(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaServicioIdAndActivoTrue(categoriaId);
    }

    public List<Impacto> getImpactos() {
        return impactoRepository.findByActivoTrueOrderByValorAsc();
    }

    public List<Urgencia> getUrgencias() {
        return urgenciaRepository.findByActivoTrueOrderByValorAsc();
    }

    public List<Prioridad> getPrioridades() {
        return prioridadRepository.findByActivoTrueOrderByNivelAsc();
    }

    public List<EstatusTicket> getEstatus() {
        return estatusRepository.findByActivoTrueOrderByOrdenAsc();
    }

    public List<UsuarioSimpleDTO> getAgentes() {
        return usuarioRepository.findSoloAgentes()
                .stream()
                .map(UsuarioSimpleDTO::from)
                .collect(Collectors.toList());
    }

    // ── DEPENDENCIAS ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Dependencia> getAllDependencias() {
        return dependenciaRepository.findAllByOrderByNombreAsc();
    }

    @Transactional
    public Dependencia saveDependencia(CatalogoRequest req) {
        String nombre = req.getNombre().trim();
        if (dependenciaRepository.existsByNombreIgnoreCase(nombre)) {
            log.warn("CATALOGO_DUPLICADO | tipo: dependencia | nombre: {}", nombre);
            throw new BusinessException("Ya existe una dependencia con el nombre: " + nombre);
        }
        Dependencia saved = dependenciaRepository.save(
                Dependencia.builder().nombre(nombre).descripcion(req.getDescripcion()).activo(true).build());
        log.info("CATALOGO_CREADO | tipo: dependencia | id: {} | nombre: {}", saved.getId(), nombre);
        return saved;
    }

    @Transactional
    public Dependencia updateDependencia(Long id, CatalogoRequest req) {
        Dependencia d = dependenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dependencia no encontrada con id: " + id));
        String nombre = req.getNombre().trim();
        if (dependenciaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            log.warn("CATALOGO_DUPLICADO | tipo: dependencia | id: {} | nombre: {}", id, nombre);
            throw new BusinessException("Ya existe una dependencia con el nombre: " + nombre);
        }
        d.setNombre(nombre);
        d.setDescripcion(req.getDescripcion());
        Dependencia saved = dependenciaRepository.save(d);
        log.info("CATALOGO_ACTUALIZADO | tipo: dependencia | id: {} | nombre: {}", id, nombre);
        return saved;
    }

    @Transactional
    public void toggleDependencia(Long id, boolean activo) {
        Dependencia d = dependenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dependencia no encontrada con id: " + id));
        d.setActivo(activo);
        dependenciaRepository.save(d);
        log.info("CATALOGO_TOGGLE | tipo: dependencia | id: {} | activo: {}", id, activo);
    }

    // ── EDIFICIOS ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Edificio> getAllEdificios() {
        return edificioRepository.findAllByOrderByNombreAsc();
    }

    @Transactional
    public Edificio saveEdificio(CatalogoRequest req) {
        String nombre = req.getNombre().trim();
        if (edificioRepository.existsByNombreIgnoreCase(nombre)) {
            log.warn("CATALOGO_DUPLICADO | tipo: edificio | nombre: {}", nombre);
            throw new BusinessException("Ya existe un edificio con el nombre: " + nombre);
        }
        Edificio saved = edificioRepository.save(Edificio.builder()
                .nombre(nombre).descripcion(req.getDescripcion())
                .direccion(req.getDireccion()).activo(true).build());
        log.info("CATALOGO_CREADO | tipo: edificio | id: {} | nombre: {}", saved.getId(), nombre);
        return saved;
    }

    @Transactional
    public Edificio updateEdificio(Long id, CatalogoRequest req) {
        Edificio e = edificioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Edificio no encontrado con id: " + id));
        String nombre = req.getNombre().trim();
        if (edificioRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            log.warn("CATALOGO_DUPLICADO | tipo: edificio | id: {} | nombre: {}", id, nombre);
            throw new BusinessException("Ya existe un edificio con el nombre: " + nombre);
        }
        e.setNombre(nombre);
        e.setDescripcion(req.getDescripcion());
        e.setDireccion(req.getDireccion());
        Edificio saved = edificioRepository.save(e);
        log.info("CATALOGO_ACTUALIZADO | tipo: edificio | id: {} | nombre: {}", id, nombre);
        return saved;
    }

    @Transactional
    public void toggleEdificio(Long id, boolean activo) {
        Edificio e = edificioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Edificio no encontrado con id: " + id));
        e.setActivo(activo);
        edificioRepository.save(e);
        log.info("CATALOGO_TOGGLE | tipo: edificio | id: {} | activo: {}", id, activo);
    }

    // ── TIPOS DE SOLICITUD ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TipoSolicitud> getAllTiposSolicitud() {
        return tipoSolicitudRepository.findAllByOrderByNombreAsc();
    }

    @Transactional
    public TipoSolicitud saveTipoSolicitud(CatalogoRequest req) {
        String nombre = req.getNombre().trim();
        if (tipoSolicitudRepository.existsByNombreIgnoreCase(nombre)) {
            log.warn("CATALOGO_DUPLICADO | tipo: tipo-solicitud | nombre: {}", nombre);
            throw new BusinessException("Ya existe un tipo de solicitud con el nombre: " + nombre);
        }
        TipoSolicitud saved = tipoSolicitudRepository.save(
                TipoSolicitud.builder().nombre(nombre).descripcion(req.getDescripcion()).activo(true).build());
        log.info("CATALOGO_CREADO | tipo: tipo-solicitud | id: {} | nombre: {}", saved.getId(), nombre);
        return saved;
    }

    @Transactional
    public TipoSolicitud updateTipoSolicitud(Long id, CatalogoRequest req) {
        TipoSolicitud t = tipoSolicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de solicitud no encontrado con id: " + id));
        String nombre = req.getNombre().trim();
        if (tipoSolicitudRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            log.warn("CATALOGO_DUPLICADO | tipo: tipo-solicitud | id: {} | nombre: {}", id, nombre);
            throw new BusinessException("Ya existe un tipo de solicitud con el nombre: " + nombre);
        }
        t.setNombre(nombre);
        t.setDescripcion(req.getDescripcion());
        TipoSolicitud saved = tipoSolicitudRepository.save(t);
        log.info("CATALOGO_ACTUALIZADO | tipo: tipo-solicitud | id: {} | nombre: {}", id, nombre);
        return saved;
    }

    @Transactional
    public void toggleTipoSolicitud(Long id, boolean activo) {
        TipoSolicitud t = tipoSolicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de solicitud no encontrado con id: " + id));
        t.setActivo(activo);
        tipoSolicitudRepository.save(t);
        log.info("CATALOGO_TOGGLE | tipo: tipo-solicitud | id: {} | activo: {}", id, activo);
    }

    // ── CATEGORÍAS DE SERVICIO ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoriaServicio> getAllCategorias() {
        return categoriaRepository.findAllByOrderByNombreAsc();
    }

    @Transactional
    public CategoriaServicio saveCategoria(CatalogoRequest req) {
        String nombre = req.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            log.warn("CATALOGO_DUPLICADO | tipo: categoria | nombre: {}", nombre);
            throw new BusinessException("Ya existe una categoría con el nombre: " + nombre);
        }
        CategoriaServicio saved = categoriaRepository.save(CategoriaServicio.builder()
                .nombre(nombre).descripcion(req.getDescripcion())
                .icono(req.getIcono()).activo(true).build());
        log.info("CATALOGO_CREADO | tipo: categoria | id: {} | nombre: {}", saved.getId(), nombre);
        return saved;
    }

    @Transactional
    public CategoriaServicio updateCategoria(Long id, CatalogoRequest req) {
        CategoriaServicio c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
        String nombre = req.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            log.warn("CATALOGO_DUPLICADO | tipo: categoria | id: {} | nombre: {}", id, nombre);
            throw new BusinessException("Ya existe una categoría con el nombre: " + nombre);
        }
        c.setNombre(nombre);
        c.setDescripcion(req.getDescripcion());
        c.setIcono(req.getIcono());
        CategoriaServicio saved = categoriaRepository.save(c);
        log.info("CATALOGO_ACTUALIZADO | tipo: categoria | id: {} | nombre: {}", id, nombre);
        return saved;
    }

    @Transactional
    public void toggleCategoria(Long id, boolean activo) {
        CategoriaServicio c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
        c.setActivo(activo);
        categoriaRepository.save(c);
        log.info("CATALOGO_TOGGLE | tipo: categoria | id: {} | activo: {}", id, activo);
    }

    // ── SUBCATEGORÍAS DE SERVICIO ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SubcategoriaServicio> getAllSubcategorias(Long categoriaId) {
        return categoriaId != null
                ? subcategoriaRepository.findByCategoriaServicioIdOrderByNombreAsc(categoriaId)
                : subcategoriaRepository.findAllByOrderByNombreAsc();
    }

    @Transactional
    public SubcategoriaServicio saveSubcategoria(CatalogoRequest req) {
        if (req.getCategoriaServicioId() == null) {
            throw new BusinessException("La categoría es requerida para la subcategoría");
        }
        CategoriaServicio cat = categoriaRepository.findById(req.getCategoriaServicioId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        String nombre = req.getNombre().trim();
        if (subcategoriaRepository.existsByNombreIgnoreCaseAndCategoriaServicioId(nombre, req.getCategoriaServicioId())) {
            log.warn("CATALOGO_DUPLICADO | tipo: subcategoria | categoriaId: {} | nombre: {}",
                    req.getCategoriaServicioId(), nombre);
            throw new BusinessException("Ya existe una subcategoría con ese nombre en esta categoría");
        }
        SubcategoriaServicio saved = subcategoriaRepository.save(SubcategoriaServicio.builder()
                .nombre(nombre).descripcion(req.getDescripcion())
                .categoriaServicio(cat).activo(true).build());
        log.info("CATALOGO_CREADO | tipo: subcategoria | id: {} | nombre: {} | categoriaId: {}",
                saved.getId(), nombre, req.getCategoriaServicioId());
        return saved;
    }

    @Transactional
    public SubcategoriaServicio updateSubcategoria(Long id, CatalogoRequest req) {
        SubcategoriaServicio s = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategoría no encontrada con id: " + id));
        String nombre = req.getNombre().trim();
        Long catId = s.getCategoriaServicio().getId();
        if (subcategoriaRepository.existsByNombreIgnoreCaseAndCategoriaServicioIdAndIdNot(nombre, catId, id)) {
            log.warn("CATALOGO_DUPLICADO | tipo: subcategoria | id: {} | categoriaId: {} | nombre: {}",
                    id, catId, nombre);
            throw new BusinessException("Ya existe una subcategoría con ese nombre en esta categoría");
        }
        s.setNombre(nombre);
        s.setDescripcion(req.getDescripcion());
        SubcategoriaServicio saved = subcategoriaRepository.save(s);
        log.info("CATALOGO_ACTUALIZADO | tipo: subcategoria | id: {} | nombre: {}", id, nombre);
        return saved;
    }

    @Transactional
    public void toggleSubcategoria(Long id, boolean activo) {
        SubcategoriaServicio s = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategoría no encontrada con id: " + id));
        s.setActivo(activo);
        subcategoriaRepository.save(s);
        log.info("CATALOGO_TOGGLE | tipo: subcategoria | id: {} | activo: {}", id, activo);
    }

    // ── ESTATUS TICKET ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EstatusTicket> getAllEstatus() {
        return estatusRepository.findAllByOrderByOrdenAsc();
    }

    @Transactional
    public EstatusTicket saveEstatus(CatalogoRequest req) {
        String nombre = req.getNombre().trim();
        if (estatusRepository.existsByNombreIgnoreCase(nombre)) {
            log.warn("CATALOGO_DUPLICADO | tipo: estatus | nombre: {}", nombre);
            throw new BusinessException("Ya existe un estatus con el nombre: " + nombre);
        }
        EstatusTicket saved = estatusRepository.save(EstatusTicket.builder()
                .nombre(nombre)
                .descripcion(req.getDescripcion())
                .orden(req.getOrden() != null ? req.getOrden() : 99)
                .color(req.getColor())
                .esFinal(Boolean.TRUE.equals(req.getEsFinal()))
                .activo(true)
                .build());
        log.info("CATALOGO_CREADO | tipo: estatus | id: {} | nombre: {} | esFinal: {}",
                saved.getId(), nombre, saved.getEsFinal());
        return saved;
    }

    @Transactional
    public EstatusTicket updateEstatus(Long id, CatalogoRequest req) {
        EstatusTicket e = estatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estatus no encontrado con id: " + id));
        String nombre = req.getNombre().trim();
        if (estatusRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            log.warn("CATALOGO_DUPLICADO | tipo: estatus | id: {} | nombre: {}", id, nombre);
            throw new BusinessException("Ya existe un estatus con el nombre: " + nombre);
        }
        e.setNombre(nombre);
        e.setDescripcion(req.getDescripcion());
        if (req.getOrden() != null) e.setOrden(req.getOrden());
        if (req.getColor() != null) e.setColor(req.getColor());
        if (req.getEsFinal() != null) e.setEsFinal(req.getEsFinal());
        EstatusTicket saved = estatusRepository.save(e);
        log.info("CATALOGO_ACTUALIZADO | tipo: estatus | id: {} | nombre: {}", id, nombre);
        return saved;
    }

    @Transactional
    public void toggleEstatus(Long id, boolean activo) {
        EstatusTicket e = estatusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estatus no encontrado con id: " + id));
        e.setActivo(activo);
        estatusRepository.save(e);
        log.info("CATALOGO_TOGGLE | tipo: estatus | id: {} | activo: {}", id, activo);
    }
}
