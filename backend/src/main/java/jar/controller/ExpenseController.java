package jar.controller;

import jakarta.validation.Valid;
import jar.model.Expense;
import jar.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin("*")
public class ExpenseController {

  @Autowired
  private ExpenseService expenseService;

  @PostMapping
  public Expense createExpense(@Valid @RequestBody Expense expense) {
    return expenseService.createExpense(expense);
  }

  @GetMapping
  public Page<Expense> getAllExpenses(
      @RequestParam(defaultValue = "") String category,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return expenseService.getAllExpenses(category, page, size);
  }

  @PutMapping("/{id}")
  public Expense updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expense) {
    return expenseService.updateExpense(id, expense);
  }

  @DeleteMapping("/{id}")
  public String deleteExpense(@PathVariable Long id) {
    return expenseService.deleteExpense(id);
  }
}
