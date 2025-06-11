# app/models/settlement.rb
class Settlement < ApplicationRecord
    belongs_to :payer, class_name: 'User'
    belongs_to :payee, class_name: 'User'
    belongs_to :group
    
    validates :amount, presence: true, numericality: { greater_than: 0, less_than: 100_000 }
    validates :description, length: { maximum: 255 }
    validates :group, presence: true
    validates :settlement_date, presence: true
    validate :different_users
    validate :both_users_in_group
    
    private
    
    def different_users
      errors.add(:payer, "cannot pay themselves") if payer_id == payee_id
    end
    
    def both_users_in_group
      return unless payer && payee && group
      
      unless group.members.include?(payer)
        errors.add(:payer, "must be a member of the group")
      end
      
      unless group.members.include?(payee)
        errors.add(:payee, "must be a member of the group")  
      end
    end

    # Get formatted description
  def formatted_description
    description.presence || "Settlement between #{payer.name} and #{payee.name}"
  end

  # Check if settlement is recent (within last 7 days)
  def recent?
    created_at >= 7.days.ago
  end

  # Get settlement summary
  def summary
    {
      id: id,
      payer: { id: payer.id, name: payer.name },
      payee: { id: payee.id, name: payee.name },
      amount: amount,
      description: formatted_description,
      date: settlement_date,
      created_at: created_at
    }
  end
  end