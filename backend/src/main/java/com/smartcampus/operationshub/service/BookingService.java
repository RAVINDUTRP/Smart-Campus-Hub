package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.dto.BookingCancelRequest;
import com.smartcampus.operationshub.dto.BookingCreateRequest;
import com.smartcampus.operationshub.dto.BookingRejectRequest;
import com.smartcampus.operationshub.dto.BookingResponse;
import com.smartcampus.operationshub.validation.BookingFilter;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingCreateRequest request);

    BookingResponse getBookingById(Long id);

    List<BookingResponse> getMyBookings(String requesterEmail);

    List<BookingResponse> getBookings(BookingFilter filter);

    BookingResponse approveBooking(Long id);

    BookingResponse rejectBooking(Long id, BookingRejectRequest request);

    BookingResponse cancelBooking(Long id, BookingCancelRequest request);
}