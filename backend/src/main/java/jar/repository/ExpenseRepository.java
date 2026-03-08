package jar.repository;

import jar.model.Expense;
import jar.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

  Page<Expense> findByUserAndCategoryContainingIgnoreCase(User user, String category, Pageable pageable);

  Optional<Expense> findByIdAndUser(Long id, User user);
}
