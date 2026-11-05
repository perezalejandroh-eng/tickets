package com.soporte.repository;

import com.soporte.entity.Ticket;
import com.soporte.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Optional<Ticket> findByFolio(String folio);

    Page<Ticket> findByUsuario(Usuario usuario, Pageable pageable);

    Page<Ticket> findByAgenteAsignado(Usuario agente, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.estatus.nombre IN ('Nuevo', 'Reabierto') ORDER BY t.prioridad.nivel DESC, t.createdAt ASC")
    List<Ticket> findTicketsNuevos();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.estatus.nombre = :estatus")
    Long countByEstatusNombre(@Param("estatus") String estatus);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.agenteAsignado = :agente AND t.estatus.esFinal = false")
    Long countTicketsActivosByAgente(@Param("agente") Usuario agente);

    @Query("SELECT t FROM Ticket t WHERE t.slaResolucion < :ahora AND t.estatus.esFinal = false")
    List<Ticket> findTicketsVencidos(@Param("ahora") LocalDateTime ahora);

    @Query("SELECT t.categoriaServicio.nombre as categoria, COUNT(t) as total FROM Ticket t GROUP BY t.categoriaServicio.nombre")
    List<Object[]> countByCategoria();

    @Query("SELECT t.dependencia.nombre as dep, COUNT(t) as total FROM Ticket t WHERE t.dependencia IS NOT NULL GROUP BY t.dependencia.nombre")
    List<Object[]> countByDependencia();

    @Query("SELECT t FROM Ticket t WHERE t.createdAt BETWEEN :inicio AND :fin")
    List<Ticket> findByPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}
