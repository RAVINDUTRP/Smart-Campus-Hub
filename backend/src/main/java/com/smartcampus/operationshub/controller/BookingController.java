package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.dto.BookingCancelRequest;
import com.smartcampus.operationshub.dto.BookingCreateRequest;
import com.smartcampus.operationshub.dto.BookingRejectRequest;
import com.smartcampus.operationshub.dto.BookingResponse;
import com.smartcampus.operationshub.service.BookingService;
import com.smartcampus.operationshub.validation.BookingFilter;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestParam String requesterEmail) {
        return ResponseEntity.ok(bookingService.getMyBookings(requesterEmail));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAll(@Valid @ModelAttribute BookingFilter filter) {
        return ResponseEntity.ok(bookingService.getBookings(filter));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> reject(@PathVariable Long id, @Valid @RequestBody BookingRejectRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable Long id, @Valid @RequestBody BookingCancelRequest request) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, request));
    }
}