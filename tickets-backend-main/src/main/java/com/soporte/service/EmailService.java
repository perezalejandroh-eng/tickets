package com.soporte.service;

import com.soporte.entity.Ticket;
import com.soporte.entity.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void enviarVerificacion(Usuario usuario) {
        try {
            Context ctx = new Context();
            ctx.setVariable("nombre", usuario.getNombreCompleto());
            ctx.setVariable("url", frontendUrl + "/verificar?token=" + usuario.getTokenVerificacion());
            String html = templateEngine.process("verificacion-correo", ctx);
            enviarHtml(usuario.getCorreo(), "Verifica tu cuenta - Soporte TI", html);
        } catch (Exception e) {
            log.error("Error enviando correo de verificación: {}", e.getMessage());
        }
    }

    @Async
    public void enviarRecuperacion(Usuario usuario) {
        try {
            Context ctx = new Context();
            ctx.setVariable("nombre", usuario.getNombreCompleto());
            ctx.setVariable("url", frontendUrl + "/reset-password?token=" + usuario.getTokenRecuperacion());
            String html = templateEngine.process("recuperacion-password", ctx);
            enviarHtml(usuario.getCorreo(), "Recuperación de contraseña - Soporte TI", html);
        } catch (Exception e) {
            log.error("Error enviando correo de recuperación: {}", e.getMessage());
        }
    }

    @Async
    public void enviarNotificacionTicket(Usuario usuario, Ticket ticket, String evento, String mensaje) {
        try {
            Context ctx = new Context();
            ctx.setVariable("nombre", usuario.getNombreCompleto());
            ctx.setVariable("folio", ticket.getFolio());
            ctx.setVariable("asunto", ticket.getAsunto());
            ctx.setVariable("evento", evento);
            ctx.setVariable("mensaje", mensaje);
            ctx.setVariable("urlTicket", frontendUrl + "/tickets/" + ticket.getId());
            String html = templateEngine.process("notificacion-ticket", ctx);
            enviarHtml(usuario.getCorreo(), "[" + ticket.getFolio() + "] " + evento + " - Soporte TI", html);
        } catch (Exception e) {
            log.error("Error enviando notificación de ticket: {}", e.getMessage());
        }
    }

    private void enviarHtml(String to, String subject, String html) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
        log.info("Correo enviado a: {}", to);
    }
}
