package com.truthshield.controller;

import com.truthshield.model.UserAccount;
import com.truthshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows flexible linking during integration tests
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");

        if (username == null || email == null || password == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username, email, and password are required.");
            return ResponseEntity.badRequest().body(error);
        }

        if (userRepository.findByUsername(username.trim()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username is already taken.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        if (userRepository.findByEmail(email.trim()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email is already in use.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        // Encrypt credentials before pushing to database
        String encodedPassword = passwordEncoder.encode(password);
        UserAccount newUser = new UserAccount(username.trim(), email.trim(), encodedPassword);
        UserAccount savedUser = userRepository.save(newUser);

        // Simulation token (JWT can be mapped symmetrically here)
        String mockToken = "token_" + savedUser.getUsername() + "_" + savedUser.getId();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", mockToken);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", savedUser.getId());
        userInfo.put("username", savedUser.getUsername());
        userInfo.put("email", savedUser.getEmail());
        response.put("user", userInfo);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String emailOrUsername = request.get("emailOrUsername");
        String password = request.get("password");

        if (emailOrUsername == null || password == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credentials identifier and password are required.");
            return ResponseEntity.badRequest().body(error);
        }

        Optional<UserAccount> userOpt = userRepository.findByUsernameOrEmail(emailOrUsername.trim(), emailOrUsername.trim());

        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials. Unauthorized access.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        UserAccount user = userOpt.get();
        String mockToken = "token_" + user.getUsername() + "_" + user.getId();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", mockToken);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        response.put("user", userInfo);

        return ResponseEntity.ok(response);
    }
}
