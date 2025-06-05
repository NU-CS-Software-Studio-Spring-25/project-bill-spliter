import { Link } from "react-router-dom";

function AboutPage(){
    return (
        <>
            <section class="py-5">
                <div class="container">
                    <div class="row gx-4 align-items-center justify-content-between">
                        <div class="col-md-5 order-2 order-md-1">
                            <div class="mt-5 mt-md-0">
                                <h2 class="display-5 fw-bold">About Us</h2>
                                <p class="lead">Welcome to our expense management application! This app is designed to help you track your expenses, manage your groups, and keep your finances in check.</p>
                                <p class="lead">Whether you're sharing expenses with friends, family, or colleagues, our app makes it easy to add, edit, and view expenses in a user-friendly interface.</p>
                                <button type="submit" style={styles.button}>
                                    <Link to="/" style={styles.button} className="text-decoration-none">Get Started</Link>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6 offset-md-1 order-1 order-md-2">
                            <div class="row gx-2 gx-lg-3">
                                <div class="col-6">
                                    <figure class="mb-2">
                                        <figcaption class="text-center mt-2 bg-light p-2 fw-bold">Easily view all of your groups</figcaption>
                                        <img class="img-fluid rounded-3" src="/HomeView.png" alt="Home View" />
                                    </figure>
                                </div>
                                <div class="col-6">
                                    <figure class="mb-2">
                                        <figcaption class="text-center mt-2 bg-light p-2 fw-bold">Check in on members, expenses, and balances for each group</figcaption>
                                        <img class="img-fluid rounded-3" src="/GroupView.png" alt="Group View" />
                                    </figure>
                                </div>
                                <div class="col-6">
                                    <figure class="mb-2">
                                        <figcaption class="text-center mt-2 bg-light p-2 fw-bold">Invite friends to new tabs</figcaption>
                                        <img class="img-fluid rounded-3" src="/NewGroup.png" alt="New Group" />
                                    </figure>
                                </div>
                                <div class="col-6">
                                    <figure class="mb-2">
                                        <figcaption class="text-center mt-2 bg-light p-2 fw-bold">Add new expenses to your groups</figcaption>
                                        <img class="img-fluid rounded-3" src="/NewExpense.png" alt="New Expense" />
                                    </figure>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AboutPage;

const styles = {
    button: {
      padding: '0.75rem',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
}