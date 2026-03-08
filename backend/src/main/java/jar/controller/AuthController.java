package jar.controller;

import jar.dto.*;
import jakarta.validation.Valid;
import jar.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

  @Autowired
  private AuthService authService;

  @PostMapping("/signup")
  public String signup(@Valid @RequestBody SignupRequest request) {
    return authService.signup(request);
  }

  @PostMapping("/login")
  public String login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @GetMapping("/me")
  public UserProfileResponse getProfile() {
    return authService.getProfile();
  }

  @PostMapping("/change-password")
  public String changePassword(@Valid @RequestBody ChangePasswordRequest request) {
    return authService.changePassword(request);
  }
}