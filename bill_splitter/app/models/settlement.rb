class Settlement < ApplicationRecord
  belongs_to :payer, class_name: 'User'
  belongs_to :payee, class_name: 'User'
  belongs_to :group

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true, inclusion: { in: %w[pending completed cancelled] }
  validates :payer_id, presence: true
  validates :payee_id, presence: true
  validates :group_id, presence: true

  # Ensure payer and payee are different users
  validate :payer_and_payee_are_different

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :completed, -> { where(status: 'completed') }
  scope :cancelled, -> { where(status: 'cancelled') }

  # Instance methods
  def complete!
    update!(status: 'completed', completed_at: Time.current)
  end

  def cancel!
    update!(status: 'cancelled')
  end

  private

  def payer_and_payee_are_different
    if payer_id == payee_id
      errors.add(:base, "Payer and payee must be different users")
    end
  end
end 