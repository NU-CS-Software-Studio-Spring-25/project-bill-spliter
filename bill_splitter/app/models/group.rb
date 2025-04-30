class Group < ApplicationRecord
    belongs_to :creator, class_name: "User", foreign_key: :created_by
  
    def members
      User.where(id: member_ids)
    end
    
    has_many :expenses
  end
  