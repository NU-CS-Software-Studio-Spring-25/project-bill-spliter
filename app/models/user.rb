# app/models/user.rb
class User < ApplicationRecord
  has_secure_password
  
  # Associations
  has_many :group_members, dependent: :destroy
  has_many :groups, through: :group_members
  has_many :created_groups, class_name: 'Group', foreign_key: 'creator_id', dependent: :destroy
  
  has_many :expenses, foreign_key: 'payer_id', dependent: :destroy
  has_many :expense_splits, dependent: :destroy
  
  has_many :paid_settlements, class_name: 'Settlement', foreign_key: 'payer_id', dependent: :destroy
  has_many :received_settlements, class_name: 'Settlement', foreign_key: 'payee_id', dependent: :destroy
  
  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }, 
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }
  validate :password_complexity, if: -> { new_record? || !password.nil? }
  
  # Callbacks
  before_save :downcase_email

  # Calculate total balance for a user across all groups
  def total_balance
    groups.sum { |group| balance_in_group(group) }
  end
  
  # Calculate balance for a user in a specific group
  def balance_in_group(group)
    # Amount user paid for expenses
    paid_amount = expenses.where(group: group).sum(:total_amount)
    
    # Amount user owes based on splits
    owed_amount = expense_splits.joins(:expense)
                               .where(expenses: { group: group })
                               .sum(:amount)
    
    # Net settlements (received - paid)
    settlements_received = received_settlements.where(group: group).sum(:amount)
    settlements_paid = paid_settlements.where(group: group).sum(:amount)
    
    # Balance = what you paid + what you received - what you owe - what you paid in settlements
    paid_amount + settlements_received - owed_amount - settlements_paid
  end
  
  # Get simplified debts for a group (who owes how much to whom)
  def debts_in_group(group)
    group.calculate_group_balances.select { |user_id, balance| 
      user_id == self.id && balance < 0 
    }
  end
  
  # Get credits for a group (who owes this user)
  def credits_in_group(group)
    group.calculate_group_balances.select { |user_id, balance| 
      user_id == self.id && balance > 0 
    }
  end

  def downcase_email
    self.email = email.downcase.strip if email.present?
  end

  private
  def password_complexity
    return if password.blank?

    unless password.match?(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)
      errors.add(:password, "must include at least one lowercase letter, one uppercase letter, one digit, and one special character.")
    end
  end
end