# app/models/group.rb
class Group < ApplicationRecord
  belongs_to :creator, class_name: 'User'
  
  has_many :group_members, dependent: :destroy
  has_many :members, through: :group_members, source: :user
  has_many :expenses, dependent: :destroy
  has_many :settlements, dependent: :destroy
  
  validates :group_name, presence: true
  validates :group_name, length: { maximum: 100 }
  
  # Calculate balances for all members in the group
  def calculate_group_balances
    balances = {}
    
    members.each do |member|
      balances[member.id] = member.balance_in_group(self)
    end
    
    balances
  end

  def self.ransackable_attributes(auth_object = nil)
    ["group_name"]
  end
  
  # Get simplified debts (who owes whom and how much)
  def simplified_debts
    balances = calculate_group_balances
    creditors = balances.select { |_, balance| balance > 0 }.sort_by { |_, balance| -balance }
    debtors = balances.select { |_, balance| balance < 0 }.sort_by { |_, balance| balance }
    
    debts = []
    
    creditors.each do |creditor_id, credit_amount|
      debtors.each do |debtor_id, debt_amount|
        next if debt_amount >= 0 || credit_amount <= 0
        
        settlement_amount = [credit_amount, -debt_amount].min
        
        debts << {
          debtor: User.find(debtor_id),
          creditor: User.find(creditor_id),
          amount: settlement_amount
        }
        
        # Update remaining amounts
        balances[creditor_id] -= settlement_amount
        balances[debtor_id] += settlement_amount
        credit_amount -= settlement_amount
        debt_amount += settlement_amount
      end
    end
    
    debts
  end
  
  # Get total group spending
  def total_spending
    expenses.sum(:total_amount)
  end

  # Get total spending for the group
  def total_spending
    expenses.sum(:total_amount)
  end

  # Get expenses by member
  def expenses_by_member
    expenses.includes(:payer).group_by(&:payer)
  end

  # Check if a user is a member
  def member?(user)
    members.include?(user)
  end

  # Get recent activity (expenses and settlements)
  def recent_activity(limit = 10)
    recent_expenses = expenses.includes(:payer)
                             .order(created_at: :desc)
                             .limit(limit)
                             .map do |expense|
      {
        type: 'expense',
        id: expense.id,
        description: expense.description,
        amount: expense.total_amount,
        user: expense.payer.name,
        date: expense.created_at
      }
    end

    recent_settlements = settlements.includes(:payer, :payee)
                                  .order(created_at: :desc)
                                  .limit(limit)
                                  .map do |settlement|
      {
        type: 'settlement',
        id: settlement.id,
        description: settlement.description || "Settlement",
        amount: settlement.amount,
        user: "#{settlement.payer.name} → #{settlement.payee.name}",
        date: settlement.created_at
      }
    end

    (recent_expenses + recent_settlements)
      .sort_by { |activity| activity[:date] }
      .reverse
      .first(limit)
  end
end