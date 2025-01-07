import styles from './landingPage.module.scss';
import avatar from '../../assets/avatar.png';
import avatar2 from '../../assets/avatar2.png';
import avatar3 from '../../assets/avatar3.png';
import avatar4 from '../../assets/avatar4.png';
import split from '../../assets/split.png';
import beach from '../../assets/beach.png';

import paris from '../../assets/paris.png';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.navbar}>
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
                <div className={styles.main}>
                    <div className={styles.information}>
                        <div className={styles.subTitle}>
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

                        <div className={styles.avatars}>
                            <img className={styles.avatarImg} src={avatar} alt="avatar" />
                            <img className={styles.avatarImg} src={avatar2} alt="avatar" />
                            <img className={styles.avatarImg} src={avatar3} alt="avatar" />
                            <img className={styles.avatarImg} src={avatar4} alt="avatar" />
                        </div>
                        <h4>
                            The best application to manage <br /> your Expenses in group
                        </h4>
                    </div>
                    <div className={styles.appImage}>
                        <div className={styles.imageMain}>
                            <div className={styles.card}>
                                <img className={styles.avatarImg} src={avatar} alt="avatar" />
                                <div className={styles.imageTitle}>
                                    <h3>Hi Jane</h3>
                                    <p>Make your groups and split bills easily</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.contentSplit}>
                            <div className={styles.trip}>
                                <img className={styles.avatarImg} src={paris} alt="avatar" />
                                <p>Trip to Paris</p>
                            </div>
                            <div className={styles.expense}>
                                <p>
                                    Total <br /> $3800
                                </p>
                                <p>
                                    To Collect <br /> $900{' '}
                                </p>
                            </div>

                            <hr />

                            <div className={styles.viewSplit}>
                                <div>
                                    <p>Split To</p>
                                    <div className={styles.avatars}>
                                        <img className={styles.avatarImg} src={avatar} alt="avatar" />
                                        <img className={styles.avatarImg} src={avatar2} alt="avatar" />
                                        <img className={styles.avatarImg} src={avatar3} alt="avatar" />
                                        <img className={styles.avatarImg} src={avatar4} alt="avatar" />
                                    </div>
                                </div>
                                <button>View Split</button>
                            </div>
                        </div>
                        <div className={styles.expenseTitle}>
                            {' '}
                            <h3>Expense History</h3>{' '}
                        </div>

                        <div className={styles.history}>
                            <div className={styles.historyTrips}>
                                <div className={styles.tripsFlex}>
                                    <img className={styles.beach} src={beach} alt="avatar" />
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
                <div className={styles.footer}>
                    <h2>Your Partner in Group Finance Management</h2>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;
