
describe 'Ordnung Config' do
  include Rack::Test::Methods

  def app
    App.new
  end

  it "redefines TOPLEVEL" do 
    expect(TOPLEVEL).to be == File.dirname(__FILE__)
  end

  it "uses the test index" do
    expect(Ordnung::Config.elasticsearch['index']).to be == "ordnung_test"
  end
end
