package com.soporte.security;

import com.soporte.entity.Usuario;
import com.soporte.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        Usuario usuario;
        try {
            Long id = Long.parseLong(identifier);
            usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con id: " + id));
        } catch (NumberFormatException e) {
            usuario = usuarioRepository.findByCorreo(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + identifier));
        }
        return UserPrincipal.create(usuario);
    }
}
