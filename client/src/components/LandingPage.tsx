import './landingPage.scss';
import avatar from '../assets/avatar.png';
import avatar2 from '../assets/avatar2.png';
import avatar3 from '../assets/avatar3.png';
import avatar4 from '../assets/avatar4.png';
import split from '../assets/split.png';
import beach from '../assets/beach.png';

import paris from '../assets/paris.png';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <>
            <div className="container">
                <div className="navbar">
                    <h1>ShareSplits</h1>
                    <ul>
                        <li>About Us</li>
                        <li>Features</li>
                        <li>Reviews</li>
                        <li>Newsletter</li>
                    </ul>

                    <Link to="/signin">
                        <button>Sign In </button>
                    </Link>
                </div>
                <div className="main">
                    <div className="information">
                        <div className="subTitle">
                            <img src={split} alt="split" />
                            <h3> Instant Split</h3>
                        </div>

                        <h2>
                            <span style={{ wordSpacing: '-0.1em' }}>
                                {' '}
                                Split & Share <br /> Expenses With &nbsp;
                            </span>
                            <span style={{ color: '#4EA582' }}>
                                Friends <br />
                                and Family
                            </span>
                        </h2>

                        <p>
                            Simplify group expenses effortlessly. Our user friendly platform makes bill splitting,
                            <br />
                            expense tracking, and payments coordination seamless. Gain financial clarity <br /> and
                            peace of mind with ShareSplits
                        </p>

                        <Link to="/signup">
                            <button>open a ShareSplits Account </button>
                        </Link>

                        <div className="avatars">
                            <img className="avatar-img" src={avatar} alt="avatar" />
                            <img className="avatar-img" src={avatar2} alt="avatar" />
                            <img className="avatar-img" src={avatar3} alt="avatar" />
                            <img className="avatar-img" src={avatar4} alt="avatar" />
                        </div>
                        <h4>
                            The best application to manage <br /> your Expenses in group
                        </h4>
                    </div>
                    <div className="app-image">
                        <div className="image-main">
                            <div className="card">
                                <img className="avatar-img" src={avatar} alt="avatar" />
                                <div className="image-title">
                                    <h3>Hi Jane</h3>
                                    <p>Make your groups and split bills easily</p>
                                </div>
                            </div>
                        </div>
                        <div className="content-split">
                            <div className="trip">
                                <img className="avatar-img" src={paris} alt="avatar" />
                                <p>Trip to Paris</p>
                            </div>
                            <div className="expense">
                                <p>
                                    Total <br /> $3800
                                </p>
                                <p>
                                    To Collect <br /> $900{' '}
                                </p>
                            </div>

                            <hr />

                            <div className="view-split">
                                <div>
                                    <p>Split To</p>
                                    <div className="avatars">
                                        <img className="avatar-img" src={avatar} alt="avatar" />
                                        <img className="avatar-img" src={avatar2} alt="avatar" />
                                        <img className="avatar-img" src={avatar3} alt="avatar" />
                                        <img className="avatar-img" src={avatar4} alt="avatar" />
                                    </div>
                                </div>
                                <button>View Split</button>
                            </div>
                        </div>
                        <div className="expense-title">
                            {' '}
                            <h3>Expense History</h3>{' '}
                        </div>

                        <div className="history">
                            <div className="history-trips">
                                <div className="trips-flex">
                                    <img className="beach" src={beach} alt="avatar" />
                                    <div>
                                        <h3>Resort Booking</h3>
                                        <p>Trip to Paris - Paid by Rini</p>
                                        <h3>20 Dec 2024</h3>
                                    </div>
                                </div>

                                <h2>$600</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer>
                <div className="footer">
                    <h2>Your Partner in Group Finance Management</h2>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;
