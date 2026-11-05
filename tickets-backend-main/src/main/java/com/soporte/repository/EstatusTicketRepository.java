package com.soporte.repository;

import com.soporte.entity.EstatusTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstatusTicketRepository extends JpaRepository<EstatusTicket, Long> {
    Optional<EstatusTicket> findByNombre(String nombre);
    List<EstatusTicket> findByActivoTrueOrderByOrdenAsc();
    List<EstatusTicket> findAllByOrderByOrdenAsc();
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
