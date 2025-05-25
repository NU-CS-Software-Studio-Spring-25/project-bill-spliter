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
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  
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

  # Get user's total expenses across all groups
  def total_expenses_paid
    expenses.sum(:total_amount)
  end

  # Get user's total amount owed across all groups
  def total_amount_owed
    expense_splits.sum(:amount)
  end

  # Get settlements made by this user
  def total_settlements_paid
    paid_settlements.sum(:amount)
  end

  # Get settlements received by this user
  def total_settlements_received
    received_settlements.sum(:amount)
  end

  # Get detailed balance breakdown
  def detailed_balance
    {
      total_paid: total_expenses_paid,
      total_owed: total_amount_owed,
      settlements_paid: total_settlements_paid,
      settlements_received: total_settlements_received,
      net_balance: total_balance
    }
  end

  # Get pending settlements (what this user needs to pay/receive)
  def pending_settlements_by_group
    groups.map do |group|
      balance = balance_in_group(group)
      {
        group: { id: group.id, name: group.group_name },
        balance: balance,
        status: balance > 0 ? 'others_owe_you' : balance < 0 ? 'you_owe_others' : 'settled'
      }
    end
  end
end