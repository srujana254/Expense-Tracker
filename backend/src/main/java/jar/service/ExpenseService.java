package jar.service;

import jar.model.Expense;
import jar.model.User;
import jar.repository.ExpenseRepository;
import jar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExpenseService {

  @Autowired
  private ExpenseRepository expenseRepository;

  @Autowired
  private UserRepository userRepository;

  public Expense createExpense(Expense expense) {
    User currentUser = getCurrentUser();
    expense.setUser(currentUser);
    return expenseRepository.save(expense);
  }

  public Page<Expense> getAllExpenses(String category, int page, int size) {
    if (page < 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page must be 0 or greater");
    }

    if (size <= 0 || size > 100) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Size must be between 1 and 100");
    }

    User currentUser = getCurrentUser();
    Pageable pageable = PageRequest.of(page, size);
    String normalizedCategory = category == null ? "" : category.trim();

    return expenseRepository.findByUserAndCategoryContainingIgnoreCase(currentUser, normalizedCategory, pageable);
  }

  public Expense updateExpense(Long id, Expense expenseDetails) {
    User currentUser = getCurrentUser();
    Expense existingExpense = expenseRepository.findByIdAndUser(id, currentUser)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found with id: " + id));

    existingExpense.setTitle(expenseDetails.getTitle());
    existingExpense.setAmount(expenseDetails.getAmount());
    existingExpense.setCategory(expenseDetails.getCategory());
    existingExpense.setDate(expenseDetails.getDate());
    existingExpense.setDescription(expenseDetails.getDescription());

    return expenseRepository.save(existingExpense);
  }

  public String deleteExpense(Long id) {
    User currentUser = getCurrentUser();
    Expense existingExpense = expenseRepository.findByIdAndUser(id, currentUser)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found with id: " + id));

    expenseRepository.delete(existingExpense);
    return "Expense deleted successfully";
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
