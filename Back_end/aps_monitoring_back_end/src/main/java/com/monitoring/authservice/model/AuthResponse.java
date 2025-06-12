package com.monitoring.authservice.model;


import java.util.List;

public record AuthResponse(String token, List<String> groups) {}
