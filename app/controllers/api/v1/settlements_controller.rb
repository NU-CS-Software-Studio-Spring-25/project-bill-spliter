# app/controllers/api/v1/settlements_controller.rb
class Api::V1::SettlementsController < ApplicationController
    skip_before_action :verify_authenticity_token
    
    def index
      settlements = if params[:group_id]
                      Settlement.includes(:payer, :payee)
                               .where(group_id: params[:group_id])
                    else
                      Settlement.includes(:payer, :payee).all
                    end
      
      render json: settlements.as_json(
        include: {
          payer: { only: [:id, :name] },
          payee: { only: [:id, :name] }
        }
      )
    end
    
    def create
      settlement = Settlement.new(settlement_params)
      
      if settlement.save
        render json: settlement.as_json(
          include: {
            payer: { only: [:id, :name] },
            payee: { only: [:id, :name] }
          }
        ), status: :created
      else
        render json: { errors: settlement.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def destroy
      settlement = Settlement.find(params[:id])
      settlement.destroy
      render json: { message: "Settlement deleted successfully" }
    end
    
    private
    
    def settlement_params
      params.require(:settlement).permit(:payer_id, :payee_id, :group_id, :amount, :description, :settlement_date)
    end
  end