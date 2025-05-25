class User < ApplicationRecord
  has_secure_password

  has_many :group_memberships, dependent: :destroy
  has_many :groups, through: :group_memberships
  has_many :created_groups, class_name: 'Group', foreign_key: 'creator_id'
  has_many :expenses, foreign_key: 'payer_id'
  has_many :expense_splits
  has_many :paid_settlements, class_name: 'Settlement', foreign_key: 'payer_id'
  has_many :received_settlements, class_name: 'Settlement', foreign_key: 'payee_id'

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }

  def total_balance
    # Sum of all expenses paid by the user
    expenses_paid = expenses.sum(:total_amount)
    
    # Sum of all expense splits owed by the user
    expenses_owed = expense_splits.sum(:amount)
    
    # Sum of all settlements paid by the user
    settlements_paid = paid_settlements.where(status: 'completed').sum(:amount)
    
    # Sum of all settlements received by the user
    settlements_received = received_settlements.where(status: 'completed').sum(:amount)
    
    # Total balance = (expenses paid + settlements paid) - (expenses owed + settlements received)
    (expenses_paid + settlements_paid) - (expenses_owed + settlements_received)
  end
end 