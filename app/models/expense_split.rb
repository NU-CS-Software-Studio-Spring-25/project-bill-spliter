# app/models/expense_split.rb
class ExpenseSplit < ApplicationRecord
  belongs_to :expense
  belongs_to :user
  
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :paid_amount, numericality: { greater_than_or_equal_to: 0 }
  
  before_save :check_settlement_status
  
  private
  
  def check_settlement_status
    self.is_settled = (paid_amount >= amount)
  end
end