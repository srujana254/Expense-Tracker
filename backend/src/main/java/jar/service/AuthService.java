package jar.service;

import jar.dto.*;
import jar.model.User;
import jar.repository.UserRepository;
import jar.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private JwtUtil jwtUtil;

  public String signup(SignupRequest request) {

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }

    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    userRepository.save(user);

    return "User registered successfully";
  }

  public String login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    return jwtUtil.generateToken(user.getEmail());
  }

  public UserProfileResponse getProfile() {
    User user = getCurrentUser();
    return new UserProfileResponse(user.getId(), user.getName(), user.getEmail());
  }

  public String changePassword(ChangePasswordRequest request) {
    User user = getCurrentUser();

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
    }

    if (request.getCurrentPassword().equals(request.getNewPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
    }

    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
    return "Password changed successfully";
  }

  private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()
        || "anonymousUser".equals(authentication.getPrincipal())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    String email = authentication.getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
  }
}