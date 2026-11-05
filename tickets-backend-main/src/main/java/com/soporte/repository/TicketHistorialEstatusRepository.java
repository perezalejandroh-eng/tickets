package com.soporte.repository;

import com.soporte.entity.TicketHistorialEstatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketHistorialEstatusRepository extends JpaRepository<TicketHistorialEstatus, Long> {
    List<TicketHistorialEstatus> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
