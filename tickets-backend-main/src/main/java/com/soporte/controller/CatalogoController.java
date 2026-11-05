package com.soporte.controller;

import com.soporte.dto.request.CatalogoRequest;
import com.soporte.dto.response.ApiResponse;
import com.soporte.dto.response.UsuarioSimpleDTO;
import com.soporte.entity.*;
import com.soporte.service.CatalogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalogo")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;

    // ── Endpoints públicos (solo activos) ──────────────────────────────────

    @GetMapping("/publico/dependencias")
    public ResponseEntity<ApiResponse<List<Dependencia>>> dependencias() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getDependencias()));
    }

    @GetMapping("/publico/edificios")
    public ResponseEntity<ApiResponse<List<Edificio>>> edificios() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getEdificios()));
    }

    @GetMapping("/publico/pisos")
    public ResponseEntity<ApiResponse<List<Piso>>> pisos(@RequestParam(required = false) Long edificioId) {
        List<Piso> pisos = edificioId != null
                ? catalogoService.getPisosByEdificio(edificioId)
                : catalogoService.getPisos();
        return ResponseEntity.ok(ApiResponse.ok(pisos));
    }

    @GetMapping("/publico/tipos-solicitud")
    public ResponseEntity<ApiResponse<List<TipoSolicitud>>> tiposSolicitud() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getTiposSolicitud()));
    }

    @GetMapping("/publico/categorias")
    public ResponseEntity<ApiResponse<List<CategoriaServicio>>> categorias() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getCategorias()));
    }

    @GetMapping("/publico/subcategorias")
    public ResponseEntity<ApiResponse<List<SubcategoriaServicio>>> subcategorias(
            @RequestParam Long categoriaId) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getSubcategorias(categoriaId)));
    }

    @GetMapping("/publico/impactos")
    public ResponseEntity<ApiResponse<List<Impacto>>> impactos() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getImpactos()));
    }

    @GetMapping("/publico/urgencias")
    public ResponseEntity<ApiResponse<List<Urgencia>>> urgencias() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getUrgencias()));
    }

    @GetMapping("/publico/prioridades")
    public ResponseEntity<ApiResponse<List<Prioridad>>> prioridades() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getPrioridades()));
    }

    @GetMapping("/publico/estatus")
    public ResponseEntity<ApiResponse<List<EstatusTicket>>> estatus() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getEstatus()));
    }

    @GetMapping("/agentes")
    public ResponseEntity<ApiResponse<List<UsuarioSimpleDTO>>> agentes() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getAgentes()));
    }

    // ── Admin: GET todos (incluyendo inactivos) ────────────────────────────

    @GetMapping("/admin/dependencias")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<Dependencia>>> adminDependencias() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getAllDependencias()));
    }

    @GetMapping("/admin/edificios")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<Edificio>>> adminEdificios() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getAllEdificios()));
    }

    @GetMapping("/admin/tipos-solicitud")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<TipoSolicitud>>> adminTiposSolicitud() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getAllTiposSolicitud()));
    }

    @GetMapping("/admin/categorias")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<CategoriaServicio>>> adminCategorias() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getAllCategorias()));
    }

    @GetMapping("/admin/subcategorias")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<SubcategoriaServicio>>> adminSubcategorias(
            @RequestParam(required = false) Long categoriaId) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getAllSubcategorias(categoriaId)));
    }

    @GetMapping("/admin/estatus")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<EstatusTicket>>> adminEstatus() {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.getAllEstatus()));
    }

    // ── Admin: POST (crear) ────────────────────────────────────────────────

    @PostMapping("/dependencias")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Dependencia>> saveDependencia(@RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogoService.saveDependencia(req)));
    }

    @PostMapping("/edificios")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Edificio>> saveEdificio(@RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogoService.saveEdificio(req)));
    }

    @PostMapping("/tipos-solicitud")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<TipoSolicitud>> saveTipoSolicitud(@RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogoService.saveTipoSolicitud(req)));
    }

    @PostMapping("/categorias")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<CategoriaServicio>> saveCategoria(@RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogoService.saveCategoria(req)));
    }

    @PostMapping("/subcategorias")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<SubcategoriaServicio>> saveSubcategoria(@RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogoService.saveSubcategoria(req)));
    }

    @PostMapping("/estatus")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<EstatusTicket>> saveEstatus(@RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogoService.saveEstatus(req)));
    }

    // ── Admin: PUT (editar) ────────────────────────────────────────────────

    @PutMapping("/dependencias/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Dependencia>> updateDependencia(
            @PathVariable Long id, @RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.updateDependencia(id, req)));
    }

    @PutMapping("/edificios/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Edificio>> updateEdificio(
            @PathVariable Long id, @RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.updateEdificio(id, req)));
    }

    @PutMapping("/tipos-solicitud/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<TipoSolicitud>> updateTipoSolicitud(
            @PathVariable Long id, @RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.updateTipoSolicitud(id, req)));
    }

    @PutMapping("/categorias/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<CategoriaServicio>> updateCategoria(
            @PathVariable Long id, @RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.updateCategoria(id, req)));
    }

    @PutMapping("/subcategorias/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<SubcategoriaServicio>> updateSubcategoria(
            @PathVariable Long id, @RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.updateSubcategoria(id, req)));
    }

    @PutMapping("/estatus/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<EstatusTicket>> updateEstatus(
            @PathVariable Long id, @RequestBody @Valid CatalogoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(catalogoService.updateEstatus(id, req)));
    }

    // ── Admin: PATCH eliminar (soft delete) ───────────────────────────────

    @PatchMapping("/dependencias/{id}/eliminar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminarDependencia(@PathVariable Long id) {
        catalogoService.toggleDependencia(id, false);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/edificios/{id}/eliminar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminarEdificio(@PathVariable Long id) {
        catalogoService.toggleEdificio(id, false);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/tipos-solicitud/{id}/eliminar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminarTipoSolicitud(@PathVariable Long id) {
        catalogoService.toggleTipoSolicitud(id, false);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/categorias/{id}/eliminar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminarCategoria(@PathVariable Long id) {
        catalogoService.toggleCategoria(id, false);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/subcategorias/{id}/eliminar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminarSubcategoria(@PathVariable Long id) {
        catalogoService.toggleSubcategoria(id, false);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/estatus/{id}/eliminar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminarEstatus(@PathVariable Long id) {
        catalogoService.toggleEstatus(id, false);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ── Admin: PATCH activar ──────────────────────────────────────────────

    @PatchMapping("/dependencias/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> activarDependencia(@PathVariable Long id) {
        catalogoService.toggleDependencia(id, true);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/edificios/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> activarEdificio(@PathVariable Long id) {
        catalogoService.toggleEdificio(id, true);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/tipos-solicitud/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> activarTipoSolicitud(@PathVariable Long id) {
        catalogoService.toggleTipoSolicitud(id, true);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/categorias/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> activarCategoria(@PathVariable Long id) {
        catalogoService.toggleCategoria(id, true);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/subcategorias/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> activarSubcategoria(@PathVariable Long id) {
        catalogoService.toggleSubcategoria(id, true);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/estatus/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> activarEstatus(@PathVariable Long id) {
        catalogoService.toggleEstatus(id, true);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
