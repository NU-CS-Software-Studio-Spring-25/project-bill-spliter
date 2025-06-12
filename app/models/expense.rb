# app/models/expense.rb
class Expense < ApplicationRecord
  belongs_to :group
  belongs_to :payer, class_name: 'User'
  has_many :expense_splits, dependent: :destroy
  has_one_attached :image
  
  validates :description, presence: true, length: { maximum: 255 }
  validates :total_amount, presence: true, numericality: { greater_than: 0, less_than: 10_000 }
  validates :expense_date, presence: true
  validates :group, presence: true
  validates :payer, presence: true
  validate :payer_must_be_member_of_group

  
  after_create :create_equal_splits
  after_update :update_splits, if: :saved_change_to_total_amount?
  
  private


  def payer_must_be_member_of_group
    return if group.blank? || payer.blank?
    
    unless group.members.include?(payer)
      errors.add(:payer, "must be a member of the group")
    end
  end
  
  def create_equal_splits
    create_splits_for_members
  end
  
  def update_splits
    expense_splits.destroy_all
    create_splits_for_members
  end
  
  def create_splits_for_members
    members = group.members
    split_amount = total_amount / members.count
    
    members.each do |member|
      expense_splits.create!(
        user: member,
        amount: split_amount
      )
    end
  end

  # Check if expense is fully settled
  def fully_settled?
    expense_splits.all?(&:is_settled?)
  end

  # Get percentage of expense that's settled
  def settlement_percentage
    return 0 if expense_splits.empty?
    
    settled_count = expense_splits.count(&:is_settled?)
    (settled_count.to_f / expense_splits.count * 100).round(2)
  end

  # Get unsettled splits
  def unsettled_splits
    expense_splits.where(is_settled: false)
  end

  # Get settled splits
  def settled_splits
    expense_splits.where(is_settled: true)
  end

  # Calculate how much each member still owes
  def outstanding_amounts
    expense_splits.where(is_settled: false).map do |split|
      {
        user: split.user,
        amount_owed: split.amount - split.paid_amount
      }
    end
  end
end